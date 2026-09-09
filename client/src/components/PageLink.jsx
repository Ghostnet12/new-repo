// Preserve ordinary browser link behavior while keeping in-app navigation seamless.
export default function PageLink({href, onNavigate, children, ...props}) {
 return <a {...props} href={href} onClick={event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onNavigate();
 }}>{children}</a>;
}
