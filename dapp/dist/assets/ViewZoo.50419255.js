import{d as A,f as b,g as w,u as E,r as h,c as a,G as p,h as T,w as V,o as l,a as d,b as e,i as k,j as x,v as C,e as m,l as I,m as v,n,t as N,s as q,A as D,p as O,k as Z,q as G}from"./index.269f9eaf.js";const R={class:"view-collection"},B={class:"container my-3"},M=["onSubmit"],z=e("label",{for:"addressInput"},"Search",-1),L={class:"input-group"},U=e("button",{class:"cz-btn cz-btn--primary px-4",type:"submit"},[e("i",{class:"bi bi-search"})],-1),j={key:0,class:"container my-3"},F=e("h1",null,"Loading Zoo...",-1),H=e("p",null,"The more assets in the Zoo, the longer this will take...",-1),$={key:1,class:"container my-3"},J={class:"gold"},K=O("'s ZOO"),X=A({setup(P){const i=b(),r=w(),t=E(Z),o=h(!0),f=a(()=>t.state.userAssets),c=a(()=>t.getters[p.ACTIVE_ACCOUNT_ADDRESS]),y=a(()=>t.getters[p.LOGGED_IN]),u=a(()=>r.query.address||c.value),s=h(""),g=()=>i.replace({name:"ViewZoo",query:{address:s.value}});return T(()=>{if(!!y.value){if(!r.query.address)return s.value=c.value,i.replace({name:"ViewZoo",query:{address:c.value}});s.value=r.query.address.toString()}}),V(()=>{o.value=!0,t.dispatch(G.FETCH_ASSETS,u.value).then(()=>{o.value=!1}).catch(console.error)}),(Q,_)=>(l(),d("div",R,[e("div",B,[e("form",{onSubmit:k(g,["prevent"])},[z,e("div",L,[x(e("input",{type:"text",class:"form-control",name:"addressInput",id:"addressInput","onUpdate:modelValue":_[0]||(_[0]=S=>s.value=S)},null,512),[[C,s.value]]),U])],40,M)]),o.value?(l(),d("div",j,[F,H,m(I)])):v("",!0),!o.value&&n(u).length>0?(l(),d("div",$,[e("h1",null,[e("span",J,N(n(q)(n(u))),1),K]),m(D,{assets:n(f),"show-title":!1,"show-feature":!1},null,8,["assets"])])):v("",!0)]))}});export{X as default};