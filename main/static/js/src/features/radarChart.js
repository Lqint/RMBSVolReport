/** Radar chart logic (from main.js: initRadar) */
export function initRadar(stats) {
    const ctx = document.getElementById('radarChart');
    if(!ctx) return;

    // 销毁旧实例
    const chartStatus = Chart.getChart("radarChart");
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }

    // === 修改点 1: 增加 others 的默认值 ===
    // 如果后端 stats 为空，确保 others 默认为 0
    const safeStats = stats || { teaching: 0, care: 0, eco: 0, mind: 0, others: 0 };

    new Chart(ctx, {
        type: 'radar',
        data: {
            // === 修改点 2: 在标签数组中添加 '其他' ===
            labels: ['支教', '社会关怀', '环保', '心之旅', '其他'],
            datasets: [{
                label: '能力值',
                // === 修改点 3: 在数据数组对应位置添加 safeStats.others ===
                data: [
                    safeStats.teaching,
                    safeStats.care,
                    safeStats.eco,
                    safeStats.mind,
                    safeStats.others // 新增的数据点
                ],
                backgroundColor: 'rgba(166, 28, 38, 0.2)',
                borderColor: '#A61C26',
                pointBackgroundColor: '#A61C26',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: { display: false },
                    pointLabels: { font: { size: 14 } },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}
