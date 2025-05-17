import { Routes as ReactRoutes, Route } from 'react-router-dom'
import Home from '../Pages/Home'
import Register from '../Pages/Register'
import UserDashboard from '../Pages/UserDashboard'
import Polls from '../Pages/Polls'
import PollDetails from '../Pages/PollDetails'
import Login from '../Pages/Login'
const Routes = () => {
  return (
    <div>
      <ReactRoutes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<UserDashboard />} />
        <Route path='/polls' element={<Polls />} />
        <Route path='/polls/:id' element={<PollDetails />} />
        <Route path='/login' element={<Login />} />
      </ReactRoutes>
    </div>
  )
}

export default Routes
