import React from 'react'
import { Route,Link,NavLink,useLocation} from 'react-router-dom'
import Button from 'react-bootstrap/Button';
const RouteNav =({setDirection}) =>{
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div>
      <Link to='/'><Button onClick={()=>setDirection(0)} variant={location.pathname === '/'?"primary":"secondary"} className='col-6 clearfix'>去程路線</Button>{}</Link>
      <Link to='/inbound'><Button onClick={()=>setDirection(1)}  variant={location.pathname === '/inbound'?"primary":"secondary"} className='col-6 clearfix'>回程路線</Button>{}</Link>
    </div>
  )
}
export default RouteNav