import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import SigninForm from './_auth/Forms/SigninForm'
import { AllUsers, CreatePost, EditPost, Explore, Home, Payment, PostDetails, Profile, Saved, UpdateProfile } from './_root/Pages'
import SignupForm from './_auth/Forms/SignupForm'
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout'
import { Toaster } from './components/ui/toaster'

function App() {

  return (
    <>
      <main className='h-screen flex'>
        <Routes>
          {/* public routes */}
          <Route element={<AuthLayout />}>
            <Route path='/sign-in' element={<SigninForm />} />
            <Route path='/sign-up' element={<SignupForm />} />
          </Route>

          {/* private routes */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />   
            <Route path="/payment" element={<Payment/>} />

           </Route>

        </Routes>
        <Toaster />

      </main>
    </>
  )
}

export default App
