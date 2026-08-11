import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
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
    <div className="dash-form">
      <form onSubmit={handleSubmit}>
        {isEditing && <div className="dash-edit-notice">✏️ عدّلي بيانات المنتج ثم أرسليه للمراجعة مرة أخرى.</div>}
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
          
          <label className="dash-image-upload-area" style={{ display: 'block', marginBottom: '16px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
            <div>اضغط لاختيار صورة من جهازك</div>
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
  );
}
