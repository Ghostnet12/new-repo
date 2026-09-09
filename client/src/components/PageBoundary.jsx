import {Component} from 'react';
import NavIcon from './NavIcon.jsx';

export function PageLoading({label='your page'}) {
 return <div className="route-pending" role="status"><NavIcon name="eye"/><p>Opening {label}…</p></div>;
}

export default class PageBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(this.state.failed)return <section className="route-error" role="alert"><NavIcon name="eye"/><h2>This page couldn’t open.</h2><p>Your connection may have paused. Refresh the page to try again.</p><button type="button" className="secondary-button" onClick={()=>window.location.reload()}>Refresh the page</button></section>;
  return this.props.children;
 }
}
