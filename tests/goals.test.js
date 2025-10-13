// 目標相關的測試
describe('目標設定功能', () => {
    // 目標物件基本結構測試
    describe('Goal 物件', () => {
        it('應該能建立包含必要屬性的目標', () => {
            const goal = new Goal({
                title: '提升職場競爭力',
                category: '個人能力發展',
                deadline: '2026-12-31',
                subGoals: ['考取 PM 證照', '精進英文能力']
            });

            assert.equal(goal.title, '提升職場競爭力');
            assert.equal(goal.category, '個人能力發展');
            assert.equal(goal.deadline, '2026-12-31');
            assert.isArray(goal.subGoals);
            assert.lengthOf(goal.subGoals, 2);
        });

        it('應該能驗證目標的有效性', () => {
            assert.throw(() => {
                new Goal({
                    title: '',  // 空標題
                    category: '個人能力發展',
                    deadline: '2026-12-31'
                });
            }, '目標標題不能為空');
        });
    });

    // 目標管理功能測試
    describe('GoalManager', () => {
        let goalManager;

        beforeEach(() => {
            goalManager = new GoalManager();
        });

        it('應該能新增目標', () => {
            const goal = {
                title: '提升職場競爭力',
                category: '個人能力發展',
                deadline: '2026-12-31'
            };

            goalManager.addGoal(goal);
            assert.lengthOf(goalManager.getGoals(), 1);
        });

        it('應該能根據類別過濾目標', () => {
            goalManager.addGoal({
                title: '提升職場競爭力',
                category: '個人能力發展',
                deadline: '2026-12-31'
            });
            goalManager.addGoal({
                title: '養成運動習慣',
                category: '外在形象提升',
                deadline: '2026-12-31'
            });

            const careerGoals = goalManager.getGoalsByCategory('個人能力發展');
            assert.lengthOf(careerGoals, 1);
            assert.equal(careerGoals[0].title, '提升職場競爭力');
        });
    });

    // 推薦系統測試
    describe('GoalRecommender', () => {
        let recommender;

        beforeEach(() => {
            recommender = new GoalRecommender();
        });

        it('應該能根據用戶情況推薦目標', () => {
            const userProfile = {
                interests: ['職場發展', '健康生活'],
                currentStatus: '想提升職場競爭力'
            };

            const recommendations = recommender.getRecommendations(userProfile);
            assert.isArray(recommendations);
            assert.isNotEmpty(recommendations);
        });
    });
});