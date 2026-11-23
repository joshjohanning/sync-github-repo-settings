const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/sync-github-repo-settings.yml'), 'utf8');
const workflowLines = workflow.split('\n');
const commentStep = workflowLines.indexOf('      - name: Comment PR with sync results');
assert.notEqual(commentStep, -1, 'Comment step must exist');
const scriptStart = workflowLines.indexOf('          script: |', commentStep);
assert.notEqual(scriptStart, -1, 'Comment script must exist');
const scriptLines = [];
for (const line of workflowLines.slice(scriptStart + 1)) {
  if (line.startsWith('            ')) {
    scriptLines.push(line.slice(12));
  } else if (line === '') {
    scriptLines.push('');
  } else {
    break;
  }
}
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const runScript = new AsyncFunction('github', 'core', 'context', 'process', scriptLines.join('\n'));

async function runComment({ results = [], env = {}, comments = [] } = {}) {
  const calls = { created: [], updated: [], deleted: [], warnings: [] };
  const github = {
    rest: {
      issues: {
        listComments: () => {},
        createComment: async params => {
          calls.created.push(params);
          return { data: { id: 100 } };
        },
        updateComment: async params => calls.updated.push(params),
        deleteComment: async params => calls.deleted.push(params)
      }
    },
    paginate: async () => comments
  };
  const core = {
    info: () => {},
    warning: message => calls.warnings.push(message)
  };
  const context = {
    repo: { owner: 'owner', repo: 'settings' },
    payload: { pull_request: { number: 7 } },
    serverUrl: 'https://github.com',
    runId: 123
  };
  const process = {
    env: {
      UPDATED_REPOSITORIES: '0',
      CHANGED_REPOSITORIES: '0',
      PENDING_REPOSITORIES: '0',
      UNCHANGED_REPOSITORIES: '0',
      WARNING_REPOSITORIES: '0',
      FAILED_REPOSITORIES: '0',
      RESULTS_JSON: JSON.stringify(results),
      UPDATE_STEP_OUTCOME: 'success',
      VERIFY_LABELS_OUTCOME: 'success',
      LABEL_REPOSITORIES: '[]',
      JOB_RESULT: 'success',
      ...env
    }
  };
  await runScript(github, core, context, process);
  return calls;
}

test('comments include the action summary table, detailed changes, and code-formatted sync PRs', async () => {
  const results = [
    {
      repository: 'octo/changed',
      success: true,
      subResults: [
        {
          kind: 'dependabot-sync',
          status: 'changed',
          syncStatus: 'would-update-pr',
          prNumber: 12,
          prUrl: 'https://github.com/octo/changed/pull/12',
          message: 'Would update dependabot'
        },
        { kind: 'settings', status: 'changed', message: 'Set <review> | workflow\nnext' }
      ]
    },
    {
      repository: 'octo/pending',
      success: true,
      subResults: [
        {
          kind: 'workflow-files-sync',
          status: 'pending',
          syncStatus: 'pr-up-to-date',
          prNumber: 34,
          prUrl: 'https://github.com/octo/pending/pull/34'
        }
      ]
    },
    {
      repository: 'octo/warning',
      success: true,
      hasWarnings: true,
      subResults: [
        { kind: 'settings', status: 'warning', message: 'Permission denied' },
        { kind: 'ruleset-create', status: 'changed', message: 'Would create "protected"' },
        { kind: 'dependabot-sync', status: 'changed', syncStatus: 'would-update', message: 'Would update dependabot' }
      ]
    },
    { repository: 'octo/clean', success: true, subResults: [] },
    { repository: 'octo/archived', success: true, archived: true },
    { repository: 'octo/failed', success: false, error: 'Access denied | check token' }
  ];
  const calls = await runComment({
    results,
    env: {
      UPDATED_REPOSITORIES: '5',
      CHANGED_REPOSITORIES: '2',
      PENDING_REPOSITORIES: '1',
      UNCHANGED_REPOSITORIES: '3',
      WARNING_REPOSITORIES: '1',
      FAILED_REPOSITORIES: '1',
      UPDATE_STEP_OUTCOME: 'failure',
      VERIFY_LABELS_OUTCOME: 'skipped',
      JOB_RESULT: 'failure'
    }
  });
  assert.equal(calls.created.length, 1);
  const body = calls.created[0].body;
  assert.match(body, /- Repositories with warnings: 1/);
  assert.ok(body.includes('| Repository | Status | Details |'));
  assert.ok(
    body.includes(
      '| octo/changed | ✅ Changed | Would update existing PR `octo/changed#12` for dependabot.yml; Set &lt;review&gt; &#124; workflow<br>next |'
    )
  );
  assert.ok(
    body.includes(
      '| octo/pending | 🔄 Pending | workflow files PR `octo/pending#34` up-to-date (pending merge) |'
    )
  );
  assert.ok(
    body.includes(
      '| octo/warning | ⚠️ Warning | Permission denied; rulesets: Would create "protected"; Would sync dependabot.yml |'
    )
  );
  assert.ok(body.includes('| octo/clean | ➖ No changes | No changes needed |'));
  assert.ok(body.includes('| octo/archived | ⏭️ Skipped | Repository is archived |'));
  assert.ok(body.includes('| octo/failed | ❌ Failed | Access denied &#124; check token |'));
  assert.ok(body.includes('<summary>Per-repository results JSON</summary>'));
  assert.ok(!body.includes('[PR #'));
});

test('label verification failures are shown as failures even when the action reports warnings', async () => {
  const calls = await runComment({
    results: [
      {
        repository: 'octo/warning',
        success: true,
        hasWarnings: true,
        labelsSync: { success: false, error: 'Forbidden' },
        subResults: [{ kind: 'labels-sync', status: 'warning', message: 'Forbidden' }]
      },
      { repository: 'octo/missing', success: true, subResults: [] }
    ],
    env: {
      UPDATED_REPOSITORIES: '2',
      UNCHANGED_REPOSITORIES: '2',
      WARNING_REPOSITORIES: '1',
      VERIFY_LABELS_OUTCOME: 'failure',
      LABEL_REPOSITORIES: JSON.stringify(['octo/warning', 'octo/missing', 'octo/absent']),
      JOB_RESULT: 'failure'
    }
  });
  const body = calls.created[0].body;
  assert.match(body, /- Repositories without changes: 0/);
  assert.match(body, /- Repositories with failures: 3/);
  assert.ok(body.includes('The sync step completed, but label sync verification failed.'));
  assert.ok(body.includes('| octo/warning | ❌ Failed | Forbidden; Label sync failed or unconfirmed |'));
  assert.ok(body.includes('| octo/missing | ❌ Failed | Label sync failed or unconfirmed |'));
  assert.ok(body.includes('| octo/absent | ❌ Failed | No repository result was returned to verify label sync |'));
});

test('missing sync results keep the failure message and update the existing comment', async () => {
  const marker = '<!-- repo-settings-sync-comment -->';
  const calls = await runComment({
    env: {
      RESULTS_JSON: '',
      UPDATE_STEP_OUTCOME: 'skipped',
      VERIFY_LABELS_OUTCOME: 'skipped',
      JOB_RESULT: 'failure'
    },
    comments: [
      { id: 10, body: `${marker} old` },
      { id: 11, body: `${marker} newer` }
    ]
  });
  assert.equal(calls.created.length, 0);
  assert.equal(calls.updated.length, 1);
  assert.equal(calls.updated[0].comment_id, 11);
  assert.ok(calls.updated[0].body.includes('The repository sync step did not run'));
  assert.ok(calls.updated[0].body.includes('No sync diff is available for this run.'));
  assert.ok(!calls.updated[0].body.includes('| Repository | Status | Details |'));
  assert.deepEqual(
    calls.deleted.map(call => call.comment_id),
    [10]
  );
});

test('sync PR references stay code-formatted regardless of URL availability or validity', async () => {
  for (const prUrl of [undefined, 'javascript:alert(1)', 'not a URL']) {
    const calls = await runComment({
      results: [
        {
          repository: 'octo/target',
          success: true,
          subResults: [
            {
              kind: 'workflow-files-sync',
              status: 'pending',
              syncStatus: 'pr-up-to-date',
              prNumber: 42,
              prUrl
            }
          ]
        }
      ],
      env: { UPDATED_REPOSITORIES: '1', PENDING_REPOSITORIES: '1' }
    });
    assert.ok(calls.created[0].body.includes('workflow files PR `octo/target#42` up-to-date (pending merge)'));
    assert.ok(!calls.created[0].body.includes('](<javascript:'));
    assert.equal(calls.warnings.length, 0);
  }
});
