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
        .select('*, products(category)')
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

  const getFamilyCategory = (family) => {
    if (family.category) return family.category
    const inferredCategories = (family.products || [])
      .map((product) => product.category)
      .filter(Boolean)
    const uniqueCategories = [...new Set(inferredCategories)]
    return uniqueCategories.length > 0 ? uniqueCategories[0] : ''
  }

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
                transition: 'transform 0.25s ease, box-shadow 0.25s ease', 
                background: 'linear-gradient(180deg, #fffaf9 0%, #ffffff 100%)',
                borderRadius: '28px',
                padding: '28px',
                marginBottom: '22px',
                boxShadow: '0 22px 50px rgba(185, 28, 28, 0.08)',
                border: '1px solid rgba(185, 28, 28, 0.14)',
                overflow: 'hidden'
              }}
              title="اضغط لعرض منتجات هذه الأسرة"
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1c1917', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em' }}>
                    {family.family_name || 'أسرة منتجة'}
                  </h3>
                  <p style={{ margin: '12px 0 0 0', color: '#4b4840', fontSize: '15px', lineHeight: '1.8', maxWidth: '520px' }}>
                    {family.bio && family.bio.trim() ? family.bio : 'أسرة منتجة متميزة تقدم أفضل المنتجات اليدوية والمنزلية.'}
                  </p>
                </div>
                {getFamilyCategory(family) && (
                  <span style={{ background: '#fef3c7', color: '#b45309', borderRadius: '9999px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.18)' }}>
                    {getFamilyCategory(family)}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gap: '12px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(185, 28, 28, 0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#b91c1c', display: 'inline-block' }} />
                  <span>{family.city || 'مصر'}</span>
                </div>
                {family.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7c2d12', fontSize: '14px', fontWeight: '600' }} dir="ltr">
                    <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#f59e0b', display: 'inline-block' }} />
                    <span>{family.whatsapp}</span>
                  </div>
                )}
              </div>
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
