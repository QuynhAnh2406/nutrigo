import React from 'react';

function RightPanel({ items }) {
  const translateType = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast': return 'Bữa sáng';
      case 'lunch': return 'Bữa trưa';
      case 'dinner': return 'Bữa tối';
      case 'snack': return 'Bữa phụ';
      default: return type;
    }
  };

  return (
    <div className="right-panel">
      <div className="section-title">
        <h2>Hôm nay có gì mới</h2>
      </div>
      <div className="side-list">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div className="side-card" style={{ flexDirection: 'column', gap: '10px' }} key={index}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="side-card-img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🥑</div>
                <div className="side-card-info">
                  <h5>{item.name}</h5>
                  <div className="side-card-meta" style={{ marginTop: '5px' }}>
                    <span className={`side-badge ${item.type?.toLowerCase()}`}>{translateType(item.type)}</span>
                    <button className="btn-icon-add" style={{ width: '22px', height: '22px', fontSize: '14px' }}>+</button>
                  </div>
                </div>
              </div>
              <div className="side-card-stats">
                <span>🔥 {item.calories} kcal</span>
                <span>🌾 {item.carbs}g Carbs</span>
                <span>🥩 {item.protein}g Protein</span>
                <span>🥑 {item.fats}g Fat</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '14px', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>
            Hôm nay chưa có tin mới
          </div>
        )}
      </div>
    </div>
  );
}

export default RightPanel;
