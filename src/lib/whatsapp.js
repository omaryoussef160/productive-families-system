export function whatsappOrderLink(product) {
  const phone = product.profiles?.whatsapp?.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(`مرحبًا، أريد طلب: ${product.name}`)}`
}
