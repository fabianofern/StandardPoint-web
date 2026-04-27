import React, { useState } from 'react';
import { openExternal } from '../utils/webAdapter';

export const AppMenu = () => {
  const [isOpen, setIsOpen] = useState(null);

  const menuItems = [
    { label: 'Arquivo', submenu: [
      { label: 'Novo', action: () => console.log('Novo Acionado') }
    ]},
    { label: 'Editar', submenu: [
      { label: 'Desfazer', action: () => document.execCommand('undo') },
      { label: 'Refazer', action: () => document.execCommand('redo') }
    ]},
    { label: 'Ajuda', submenu: [
      { label: 'Documentação', action: () => openExternal('https://docs.seusite.com') }
    ]}
  ];

  return (
    <nav style={{ display: 'flex', background: '#333', color: '#fff', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
      {menuItems.map((item, idx) => (
        <div key={idx} style={{ position: 'relative', marginRight: '1rem' }} onMouseLeave={() => setIsOpen(null)}>
          <button 
            onClick={() => setIsOpen(isOpen === idx ? null : idx)}
            onMouseEnter={() => setIsOpen(idx)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            {item.label}
          </button>
          
          {isOpen === idx && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              background: '#444', 
              minWidth: '150px',
              zIndex: 1000,
              border: '1px solid #555',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {item.submenu.map((sub, subIdx) => (
                <div 
                  key={subIdx}
                  onClick={() => { sub.action(); setIsOpen(null); }}
                  style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: subIdx < item.submenu.length -1 ? '1px solid #555' : 'none' }}
                >
                  {sub.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AppMenu;
