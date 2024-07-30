"use client"

import React, { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

type signupProps = {
    
};

const Signup:React.FC<signupProps> = () => {
    const [signUpForm, setSignUpForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        userType:""
      });
      const [error, setError] = useState("");
      const [createUserWithEmailAndPassword, userCred, loading, userError] =
        useCreateUserWithEmailAndPassword(auth);
    
      //Firebase Logic
    
      const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (error) setError("");
        console.log(error);
        if (signUpForm.password !== signUpForm.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
    
        const user = await createUserWithEmailAndPassword(
          signUpForm.email,
          signUpForm.password
        );
        if (user) {
          //add user to db

          const userData = {
            ...user.user,
            userType: signUpForm.userType,
          };
          try {
            const userRef = doc(firestore, "users", user.user.uid)
            console.log(user.user)
            await setDoc(userRef, JSON.parse(JSON.stringify(userData)))

          } catch(e){
            console.log(e)
          }
        }
      };
      const onChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        setSignUpForm((prev) => ({
          ...prev,
          [event.target.name]: event.target.value,
        }));
      };
    
    return(
        <>
        <form onSubmit={onSubmit}>
        <div className=' hidden'>{!userCred}{loading}</div>
        <div className='pb-2'>
        <select name="userType" onChange={onChange} className="select select-bordered w-full max-w-xs flex items-center gap-2">
            <option disabled selected>User Type</option>
            <option value={'clinic'}>Clinic</option>
            <option value={'doctor'}>Doctor</option>
            </select>
        </div>
        <div className='pb-2'>
        <label className="input input-bordered flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
            <input required name="email" type="email" className="grow" placeholder="Email" onChange={onChange}/>
        </label>
        </div>
        <div className='pb-2'>
        <label className="input input-bordered flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
            <input required name="password" type="password" className="grow" placeholder="Password" onChange={onChange} />
        </label>
        </div>
        <div className='pb-4'>
        <label className="input input-bordered flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
            <input required name="confirmPassword" type="password" className="grow" placeholder="Confirm Password" onChange={onChange} />
        </label>
        </div>
        {error && <p className="text-red-500 w-full text-center pb-1">{error}</p>}
        {userError && <p className="text-red-500 w-full text-center pb-1">{userError.message}</p>}
        <button type="submit" className='btn btn-primary w-full'>Log In</button>
        </form>
        </>
    )
}
export default Signup;