'use client'

import React, { useEffect, useState } from 'react';
import Signup from './signup';
import Login from './login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { redirect } from 'next/navigation';

type accountProps = {
    
};

const Account:React.FC<accountProps> = () => {
    const [signup, setSignup] = useState(false)
    const [user] = useAuthState(auth)

    useEffect(()=>{
        if (user) {
            redirect('/console')  
        } 
    }, [user])
    return(
        <>
        {signup ? <Signup /> : <Login />}
        <div className='cursor-pointer pt-2 text-center text-sm'>
        {signup ? <a onClick={() => setSignup(false)}>Already have an account? Click here to Login instead.</a> : <a onClick={() => setSignup(true)}>Don't have an account? Click here to sign up.</a>}
        </div>
        </>
    )
}
export default Account;