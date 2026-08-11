const steps = [['١', 'سجّلي بياناتك', 'اكتبي اسم النشاط ومنطقتك ونوع المنتجات ورقم واتساب.'], ['٢', 'اعرضي منتجاتك', 'صوري شغلك وحطي السعر — العملاء هيشوفوا شغلك على طول.'], ['٣', 'استقبلي الطلبات', 'العميل يبعتلك على واتساب مباشرة، من غير عمولة.']]

export function HowItWorks() {
  return <section id="how" className="html-how-section"><div className="html-how-container"><h2>إزاي تبدأي البيع على المنصة</h2><div className="html-how-grid">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
}
