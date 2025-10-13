// 改善計畫相關的測試
describe('改善計畫功能', () => {
    // 計畫生成器測試
    describe('PlanGenerator', () => {
        let planGenerator;

        beforeEach(() => {
            planGenerator = new PlanGenerator();
        });

        it('應該能根據目標生成改善計畫', () => {
            const goal = {
                title: '提升職場競爭力',
                category: '個人能力發展',
                subGoals: ['考取 PM 證照', '精進英文能力']
            };

            const plan = planGenerator.generatePlan(goal);
            assert.isObject(plan);
            assert.property(plan, 'stages');
            assert.isArray(plan.stages);
            assert.isNotEmpty(plan.stages);
        });

        it('每個階段應包含具體的任務與時程', () => {
            const goal = {
                title: '提升職場競爭力',
                category: '個人能力發展',
                subGoals: ['考取 PM 證照']
            };

            const plan = planGenerator.generatePlan(goal);
            const firstStage = plan.stages[0];

            assert.property(firstStage, 'tasks');
            assert.property(firstStage, 'duration');
            assert.property(firstStage, 'milestones');
        });
    });

    // 進度追蹤測試
    describe('ProgressTracker', () => {
        let tracker;

        beforeEach(() => {
            tracker = new ProgressTracker();
        });

        it('應該能記錄任務完成狀態', () => {
            const taskId = 'task-1';
            tracker.completeTask(taskId);
            assert.isTrue(tracker.isTaskCompleted(taskId));
        });

        it('應該能計算總體進度百分比', () => {
            const plan = {
                stages: [{
                    tasks: [{id: 'task-1'}, {id: 'task-2'}]
                }]
            };

            tracker.setPlan(plan);
            tracker.completeTask('task-1');

            const progress = tracker.calculateProgress();
            assert.equal(progress, 50);
        });
    });

    // 獎勵系統測試
    describe('RewardSystem', () => {
        let rewardSystem;

        beforeEach(() => {
            rewardSystem = new RewardSystem();
        });

        it('應該能根據完成的任務授予成就徽章', () => {
            const task = {
                id: 'task-1',
                type: 'learning',
                difficulty: 'medium'
            };

            const badges = rewardSystem.getBadgesForTask(task);
            assert.isArray(badges);
        });

        it('應該能追蹤用戶的累計成就', () => {
            rewardSystem.awardBadge('first-goal-set');
            rewardSystem.awardBadge('week-streak');

            const userAchievements = rewardSystem.getUserAchievements();
            assert.lengthOf(userAchievements, 2);
        });
    });
});