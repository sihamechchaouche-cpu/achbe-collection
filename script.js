// ACHBÉ Collection — boutique avec commande directe WhatsApp
// Remplacez les produits de démonstration par vos vrais articles avant publication.
const WHATSAPP_NUMBER = "212611891048"; // format international sans + ni espaces

const products = [
  {id:1,name:"Tailleur gris",category:"Ensembles",price:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Gris"],image:"tailleur-gris.jpg",description:"Blazer structuré et pantalon large"},
  {id:2,name:"Chemise marron",category:"Hauts",price:500,sizes:["XS","S","M","L","XL","XXL"],colors:["Marron"],image:"chemise-marron.jpg",images:["chemise-marron.jpg","chemise-marron-2.jpg"],description:"Chemise marron élégante à manches longues. Coupe fluide, col classique et poignets boutonnés. Prix : 500 DH."},
  {id:3,name:"Blouse classique",category:"Hauts",price:0,sizes:["S","M","L","XL"],colors:["Blanc","Noir"],image:"",description:"Modèle de démonstration"},
  {id:4,name:"Pantalon moderne",category:"Pantalons",price:0,sizes:["S","M","L","XL"],colors:["Noir","Beige"],image:"",description:"Modèle de démonstration"},
  {id:5,name:"Robe quotidienne",category:"Robes",price:0,sizes:["S","M","L"],colors:["Bleu","Noir"],image:"",description:"Modèle de démonstration"},
  {id:6,name:"Ensemble tendance",category:"Ensembles",price:0,sizes:["M","L","XL"],colors:["Marron","Noir"],image:"",description:"Modèle de démonstration"},
  {id:7,name:"Top minimaliste",category:"Hauts",price:0,sizes:["XS","S","M","L"],colors:["Blanc","Beige"],image:"",description:"Modèle de démonstration"},
  {id:8,name:"Pantalon fluide",category:"Pantalons",price:0,sizes:["S","M","L","XL","XXL"],colors:["Noir","Gris"],image:"",description:"Modèle de démonstration"}
];
let cart = [];
let activeCategory = "Tous";
let selectedProduct = null;

function money(n){ return Number(n||0).toLocaleString("fr-MA") + " DH"; }
function renderProducts(){
  const root=document.getElementById("products");
  if(!root) return;
  const shown=products.filter(p=>activeCategory==="Tous"||p.category===activeCategory);
  root.innerHTML=shown.map(p=>`
    <article class="product">
      <div class="photo">${p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}">` : `<div>${escapeHtml(p.category)}<small>PHOTO À AJOUTER</small></div>`}</div>
      <div class="pname">${escapeHtml(p.name)}</div>
      <div class="meta">${escapeHtml(p.category)} · Tailles ${escapeHtml(p.sizes.join(", "))}</div>
      <div class="price">${p.price>0 ? money(p.price) : "Prix à confirmer"}</div>
      <button type="button" onclick="showDetails(${p.id})">Voir les photos et détails</button><button type="button" class="detailbtn" onclick="chooseProduct(${p.id})">Commander ce modèle</button>
    </article>`).join("");
}
function showDetails(id){
  const p=products.find(item=>item.id===id);
  if(!p)return;
  const pics=(p.images&&p.images.length?p.images:(p.image?[p.image]:[]));
  document.getElementById("detailContent").innerHTML=`
    <div class="eyebrow">${escapeHtml(p.category)}</div>
    <h3>${escapeHtml(p.name)}</h3>
    <div class="gallery-grid">${pics.map(src=>`<img src="${escapeAttr(src)}" alt="${escapeAttr(p.name)}">`).join("")}</div>
    <p class="detail-desc">${escapeHtml(p.description||"")}</p>
    <p><strong>${p.price>0?money(p.price):"Prix à confirmer"}</strong></p>
    <p class="hint">Tailles disponibles : ${escapeHtml(p.sizes.join(", "))} · Couleur : ${escapeHtml(p.colors.join(", "))}</p>
    <button class="btn" style="width:100%" onclick="closeDetails();chooseProduct(${p.id})">Ajouter au panier / Commander</button>`;
  document.getElementById("detailModal").classList.add("open");
}
function closeDetails(){document.getElementById("detailModal").classList.remove("open");}
function detailBackdrop(e){if(e.target.id==="detailModal")closeDetails();}
function filter(category,button){
  activeCategory=category;
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  if(button) button.classList.add("active");
  renderProducts();
}
function chooseProduct(id){
  selectedProduct=products.find(p=>p.id===id);
  if(!selectedProduct)return;
  const size=selectedProduct.sizes[0]||"À confirmer";
  const color=selectedProduct.colors[0]||"À confirmer";
  cart.push({...selectedProduct, size, color, qty:1});
  updateCart();
  openCart();
}
function updateCart(){
  document.getElementById("count").textContent=cart.reduce((n,p)=>n+p.qty,0);
  const root=document.getElementById("items");
  if(!root)return;
  if(!cart.length){root.innerHTML='<p class="hint">Votre panier est vide. Choisissez un modèle dans la collection.</p>';return;}
  root.innerHTML=cart.map((p,i)=>`
    <div class="line">
      <strong>${escapeHtml(p.name)}</strong><br>
      <span class="hint">${p.price>0?money(p.price):"Prix à confirmer"} · Taille et couleur à préciser sur WhatsApp</span>
      <div class="field"><label>Taille</label><select onchange="changeItem(${i},'size',this.value)">${p.sizes.map(s=>`<option ${p.size===s?'selected':''}>${escapeHtml(s)}</option>`).join("")}</select></div>
      <div class="field"><label>Couleur</label><select onchange="changeItem(${i},'color',this.value)">${p.colors.map(c=>`<option ${p.color===c?'selected':''}>${escapeHtml(c)}</option>`).join("")}</select></div>
      <div class="field"><label>Quantité</label><input type="number" min="1" max="20" value="${p.qty}" onchange="changeItem(${i},'qty',this.value)"></div>
      <button type="button" class="filter" onclick="removeItem(${i})">Retirer</button>
    </div>`).join("")+
    `<p><strong>Total indicatif : ${cart.every(p=>p.price>0)?money(cart.reduce((n,p)=>n+p.price*p.qty,0)):"Prix à confirmer sur WhatsApp"}</strong></p>`;
}
function changeItem(i,key,value){
  if(!cart[i])return;
  cart[i][key]=key==="qty"?Math.max(1,Math.min(20,parseInt(value,10)||1)):value;
  updateCart();
}
function removeItem(i){cart.splice(i,1);updateCart();}
function openCart(){document.getElementById("modal").classList.add("open");updateCart();}
function closeCart(){document.getElementById("modal").classList.remove("open");}
function backdrop(e){if(e.target.id==="modal")closeCart();}
function sendOrder(){
  if(!cart.length){alert("Votre panier est vide. Choisissez d’abord un article.");return;}
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const city=document.getElementById("city").value.trim();
  const note=document.getElementById("noteInput").value.trim();
  if(!name){alert("Veuillez saisir votre nom.");document.getElementById("name").focus();return;}
  let lines=cart.map((p,i)=>`${i+1}. ${p.name} — Taille: ${p.size} — Couleur: ${p.color} — Quantité: ${p.qty} — Prix: ${p.price>0?money(p.price):"à confirmer"}`);
  let total=cart.every(p=>p.price>0)?money(cart.reduce((n,p)=>n+p.price*p.qty,0)):"à confirmer";
  const message=`Bonjour ACHBÉ Collection, je souhaite commander :\n\n${lines.join("\n")}\n\nTotal indicatif : ${total}\nNom : ${name}\nTéléphone : ${phone||"à communiquer"}\nVille de livraison : ${city||"à confirmer"}\nPrécisions : ${note||"aucune"}\n\nMerci de confirmer la disponibilité et les frais de livraison.`;
  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url,"_blank","noopener,noreferrer");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}
document.addEventListener("DOMContentLoaded",()=>{document.getElementById("year").textContent=new Date().getFullYear();renderProducts();updateCart();});
