import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import dashAddImg from '../../assets/images/dash-add.jpg';
import { categories } from '../../data/catalog';

export default function AddProduct({ session, onNotice, onNavigate, productToEdit, onEditComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '',
    price: '',
    description: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const isEditing = Boolean(productToEdit);

  useEffect(() => {
    if (productToEdit) {
      setFormData({ name: productToEdit.name || '', category: productToEdit.category || categories[0] || '', price: String(productToEdit.price || ''), description: productToEdit.description || '', image_url: productToEdit.image_url || '' });
      setImagePreview(productToEdit.image_url || '');
      setImageFile(null);
    }
  }, [productToEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear manual URL if file is selected
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      // Upload image if file selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const productData = { name: formData.name, category: formData.category, price: parseFloat(formData.price), description: formData.description, image_url: finalImageUrl, status: 'pending' };
      const { error } = isEditing
        ? await supabase.from('products').update(productData).eq('id', productToEdit.id).eq('owner_id', session.user.id)
        : await supabase.from('products').insert([{ ...productData, owner_id: session.user.id }]);
      if (error) throw error;
      onNotice(isEditing ? 'تم تعديل المنتج وإرساله للمراجعة مرة أخرى.' : 'تم إضافة المنتج بنجاح. هو الآن قيد المراجعة.', 'success');
      onEditComplete?.();
      onNavigate('products');

    } catch (err) {
      console.error('Error adding product:', err);
      onNotice('حدث خطأ أثناء إضافة المنتج. حاول مرة أخرى.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div className="dash-form" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Cover Image Header */}
        <div style={{ height: '240px', position: 'relative' }}>
          <img src={dashAddImg} alt="Add Product" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,1), transparent 60%)', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', inset: 0, background: '#fdf5df', zIndex: -1 }}></div>
        </div>

        {/* Form Container */}
        <div style={{ padding: '0 40px 40px', marginTop: '-10px', position: 'relative', zIndex: 2 }}>
          
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className="dash-heading" style={{ fontSize: '28px', color: '#b91c1c', marginBottom: '8px' }}>
              {productToEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '15px' }}>
              {productToEdit ? 'قومي بتحديث تفاصيل منتجك الحالي هنا.' : 'شاركي إبداعاتك مع العالم! أضيفي صور واضحة وتفاصيل دقيقة لمنتجك الجديد ليتم مراجعته وعرضه في المتجر.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
        {isEditing && <div className="dash-edit-notice">عدّلي بيانات المنتج ثم أرسليه للمراجعة مرة أخرى.</div>}
        <div className="dash-form-group">
          <label className="dash-label">اسم المنتج</label>
          <input
            type="text"
            required
            className="dash-input"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="مثال: صينية مكرونة بالبشاميل"
          />
        </div>

        <div className="dash-form-row">
          <div className="dash-form-group">
            <label className="dash-label">القسم</label>
            <select
              required
              className="dash-select"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">اختر القسم</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="dash-form-group">
            <label className="dash-label">السعر (ج.م)</label>
            <input
              type="number"
              required
              min="1"
              className="dash-input"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>

        <div className="dash-form-group">
          <label className="dash-label">وصف المنتج</label>
          <textarea
            required
            className="dash-textarea"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="وصف تفصيلي لمكونات المنتج..."
          />
        </div>

        <div className="dash-form-group">
          <label className="dash-label">صورة المنتج</label>
          
          <label className="dash-image-upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', border: '2px dashed var(--dash-border)', borderRadius: '16px', cursor: 'pointer', background: '#fafaf9', transition: 'all 0.2s ease', marginBottom: '16px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div style={{ fontWeight: '600', color: '#57534e', marginBottom: '4px' }}>اضغطي لاختيار صورة المنتج</div>
            <div style={{ fontSize: '12px', color: '#a8a29e' }}>JPG, PNG أو WEBP (الحد الأقصى 5MB)</div>
          </label>
          
          <div style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--dash-text-muted)' }}>أو</div>
          
          <input
            type="url"
            className="dash-input"
            value={formData.image_url}
            onChange={(e) => {
              setFormData({...formData, image_url: e.target.value});
              setImagePreview(e.target.value);
              setImageFile(null);
            }}
            placeholder="رابط صورة مباشر (URL)"
          />

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="dash-preview-image" />
          )}
        </div>

        <button 
          type="submit" 
          className="dash-btn dash-btn-primary dash-btn-lg" 
          style={{ width: '100%', marginTop: '16px' }}
          disabled={loading}
        >
          {loading ? (isEditing ? 'جارٍ حفظ التعديلات...' : 'جاري الإضافة...') : (isEditing ? 'حفظ وإعادة للمراجعة' : 'إضافة المنتج')}
        </button>
      </form>
    </div>
    </div>
    </div>
  );
}
