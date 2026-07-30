import { useState } from 'react'
import Navbar from './components/Navbar';
import DoctorList from './components/DoctorList';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <DoctorList/>
    </>
  )
}

export default App
