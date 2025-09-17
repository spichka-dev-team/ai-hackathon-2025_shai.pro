import { Navigate, Route, Routes } from 'react-router-dom'
import { HomeLayout } from '../ui/HomeLayout/HomeLayout'
import { OptionOne } from '../ui/pages/OptionOne'
import { OptionTwo } from '../ui/pages/OptionTwo'
import { OptionThree } from '../ui/pages/OptionThree'
import { OptionFour } from '../ui/pages/OptionFour'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}> 
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<OptionOne />} />
        <Route path="people" element={<OptionTwo />} />
        <Route path="calls" element={<OptionThree />} />
        <Route path="roadmap" element={<OptionFour />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


