'use client'

import { useEffect, useState } from "react"
import { Patient } from "../../page"
import { doc, getDoc } from "firebase/firestore"
import { auth, firestore } from "@/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import PatientScans from "@/components/patientscans"

export default function PatientPage({ params }: { params: { id: string } }){

    const bgColor = {
        // default: '',
        ["No Diagnosis" as string]: 'bg-neutral-content text-neutral rounded-full px-2 ml-2 font-semibold',
        ["Clear" as string]: 'bg-green-500 text-neutral rounded-full px-2 ml-2 font-semibold',
        ["Cancer" as string]: 'bg-red-500 text-neutral rounded-full px-2 ml-2 font-semibold',
    }

    const bgColor2 = {
        // default: '',
        ["No Scans" as string]: 'bg-neutral-content text-neutral rounded-full px-2 ml-2 font-semibold',
        ["Clear" as string]: 'bg-green-500 text-neutral rounded-full px-2 ml-2 font-semibold',
        ["Cancer" as string]: 'bg-red-500 text-neutral rounded-full px-2 ml-2 font-semibold',
    }

    const [user] = useAuthState(auth)

    const [patient, setPatient] = useState<Patient>()

    useEffect(()=>{
        const getPatient = async () => {
            if (user){
                const patientRef = doc(firestore, 'users', user.uid, 'patients', params.id)
                const patientDoc = await getDoc(patientRef)
                if (patientDoc.exists()){
                    setPatient(patientDoc.data() as Patient)
                } else {
                    setPatient(undefined)
                }
            } else {
                console.log('No User')
            }
        }

        getPatient()

    })
    return(
        <>
            {patient ? 
            <div className="mx-10 mt-10 flex md:flex-row lg:flex-row flex-col ">
            <div className="lg:w-[50%] md:w-[50%] w-full items-center">
            <div className="flex items-center">
                <img className="rounded-full h-[100px] w-[100px] shadow-lg border-[2px] border-primary mr-5" src={patient.imageURL}/>
                <div>
                    <h2 className="text-3xl font-sans font-semibold">{patient.name}</h2>
                    <p className="flex mt-2">Age: <p className="font-semibold ml-1">{patient.age}</p></p>
                </div>
            </div> 
            <p className=" text-lg font-semibold mt-2 mb-1">Status:</p>
            <p className="flex mb-2">Pathologist: <p className={bgColor[patient.pathologist]}>{patient.pathologist}</p> </p>
            <p className="flex">AI Diagnosis: <p className={bgColor2[patient.biopsis]}>{patient.biopsis}</p> </p>

            <p className=" text-lg font-semibold mt-2 mb-1">Contact:</p>
            <p className="flex mb-1">Phone Number: <p className="ml-2 font-semibold">{patient.phone}</p> </p>
            <p className="flex mb-1">Email: <p className="ml-2 font-semibold">{patient.email}</p> </p>
            <p className="flex">Insurance Provider: <p className="ml-2 font-semibold">{patient.insurance}</p> </p>
            </div>
            <div className=" lg:w-[50%] md:w-[50%] w-full">
                <PatientScans patientId={params.id} user={user}/>
            </div>
            </div>
            : 
            <div className="flex flex-col w-full justify-center items-center mt-20">
                <h2 className="text-4xl font-medium mb-1">404</h2>
                <p>A patient with this ID could not be found.</p>
            </div>
            }
        </>
    )
}