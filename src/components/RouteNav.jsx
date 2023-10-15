import React from 'react'
import { Route,Link,NavLink } from 'react-router-dom'
const RouteNav =() =>{
  return (
    <div className='route-nav'>
        <div className="outbound"><Link to='/'>去程路線</Link></div>
        <div className="inbound"><Link to='/inbound'>回程路線</Link></div>
    </div>
  )
}
export default RouteNav