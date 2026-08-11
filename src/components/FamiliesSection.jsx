import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../supabase';

export function FamiliesSection({ onSelectFamily }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedFamilies();
  }, []);

  const fetchApprovedFamilies = async () => {
    try {
      if (!isConfigured) {
        setFamilies([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const actualFamilies = (data || []).filter(f => !f.is_admin);
      setFamilies(actualFamilies);
    } catch (err) {
      console.error('Error fetching approved families:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="families" className="source-families">
      <h2 style={{ color: '#1c1917', fontWeight: '800' }}>الأسر المنتجة على المنصة</h2>
      <p style={{ color: '#57534e', fontSize: '15px' }}>اضغطي على أي أسرة لتصفح كافة منتجاتها المعروضة.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#fbbf24', fontWeight: '600' }}>جاري تحميل الأسر المسجلة...</div>
      ) : families.length > 0 ? (
        <div>
          {families.map(family => (
            <article 
              key={family.id || family.family_name}
              onClick={() => onSelectFamily && onSelectFamily(family)}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease', 
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '16px',
                padding: '22px 24px',
                marginBottom: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
              title="اضغط لعرض منتجات هذه الأسرة"
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#1c1917', fontSize: '20px', fontWeight: '800' }}>
                  {family.family_name || 'أسرة منتجة'}
                </h3>
                <span style={{ 
                  fontSize: '12.5px', 
                  color: '#ffffff', 
                  fontWeight: '700', 
                  background: '#b91c1c', 
                  padding: '6px 14px', 
                  borderRadius: '8px', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(185, 28, 28, 0.25)'
                }}>
                  <span>عرض منتجات الأسرة</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7 7 17 7 17 17"/>
                  </svg>
                </span>
              </div>

              {/* Location & Contact Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '13px', color: '#b91c1c', fontWeight: '700' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{family.city || 'مصر'}</span>
                </div>
                {family.whatsapp && (
                  <span style={{ color: '#78716c', fontSize: '12.5px', fontWeight: '500' }} dir="ltr">
                    · {family.whatsapp}
                  </span>
                )}
              </div>

              {/* High Contrast Readable Bio Paragraph */}
              <p style={{ marginTop: '10px', lineHeight: '1.7', color: '#44403c', fontSize: '14.5px', margin: '10px 0 0 0', fontWeight: '500' }}>
                {family.bio && family.bio.trim() ? family.bio : 'أسرة منتجة متميزة تقدم أفضل المنتجات اليدوية والمنزلية.'}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#d6d3d1', background: 'rgba(0,0,0,0.3)', border: '1px dashed #44403c', borderRadius: '14px', marginTop: '20px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>لا توجد أسر منتجة مسجلة ومفعلة حالياً على المنصة.</p>
        </div>
      )}
    </section>
  );
}
