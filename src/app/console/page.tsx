'use client'

import { auth, firestore, storage } from "@/firebase";
import useSelectFile from "@/hooks/useSelectFile";
import firebase from "firebase/compat/app";
import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import router from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";


type Patient = {
    id: string,
    name: string,
    age: string,
    phone: string,
    email: string,
    insurance: string,
    biopsis: string,
    imageURL?: string
}

export default function Console(){
    const [user] = useAuthState(auth)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [patients, setPatients] = useState<Patient[]>([])
    
    const [patientForm, setPatientForm] = useState({
        name:'',
        age:'',
        phone:'',
        email:'',
        insurance:'',
    })

    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();

    const getPatients = async () =>{
        if (user) {
            const querySnapshot = await getDocs(collection(firestore, "users", user.uid, "patients"));
            querySnapshot.forEach((doc) => {
                setPatients([...patients, doc.data() as Patient])
            });
        }

    }
    
    useEffect(()=>{
        getPatients()   
    }, [user])


    const onSubmit = async () => {
        setLoading(true);
        if (user) {

            try {

            const patientDocRef = doc(collection(firestore, "users", user.uid, 'patients'))
            const patientData = {
                ...patientForm,
                id:patientDocRef.id,
                biopsis: "No Scans",
            }
            await setDoc(patientDocRef, JSON.parse(JSON.stringify(patientData)));
            const newDocRef = doc(firestore, "users", user.uid, 'patients', patientDocRef.id)
            // check for selected file
            if (selectedFile) {
                //store it in storage => getDownloadURL (return imageURL) => stored in DB
                const imageRef = ref(storage, `profiles/${patientDocRef.id}/image`);
                await uploadString(imageRef, selectedFile, "data_url");
                //update post with URL
                const downloadURL = await getDownloadURL(imageRef);
    
                await updateDoc(newDocRef, {
                imageURL: downloadURL,
                });
            }

            setPatients([...patients, patientData])

            } catch (error: any) {
            console.log("addPatient error", error.message);
            setError(error.message);
            setLoading(false);
            }
        }else{
            setError("No User")
            setLoading(false);
        }
        setLoading(false);
    }


    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPatientForm((prev) => ({
          ...prev,
          [event.target.name]: event.target.value,
        }));
    };
    return(
        <>
        <div className="mx-4 mt-5">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-medium">Patients</h2>
                <div>
                    {/* Open the modal using document.getElementById('ID').showModal() method */}
                    <button className="btn btn-primary" onClick={() => {
                    const dialog = document.getElementById('my_modal_1') as HTMLDialogElement;
                    dialog.showModal();
                    }}>Add Patient</button>
                    <dialog id="my_modal_1" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Add Patient</h3>
                        <form className="py-2">
                            <p className="my-2">Name</p>
                            <input name="name" onChange={onChange} type="text" placeholder="Patient Name" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Age</p>
                            <input name="age" onChange={onChange} type="number" placeholder="Patient Age" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Phone Number</p>
                            <input name="phone" onChange={onChange} type="tel" placeholder="Patient Phone Number" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Email</p>
                            <input name="email" onChange={onChange} type="email" placeholder="Patient Email" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Insurance</p>
                            <input name="insurance" onChange={onChange} type="text" placeholder="Patient Insurance Provider" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Patient Photo</p>
                            <input name="pfp" onChange={onSelectFile} type="file" className="file-input file-input-bordered w-full max-w-xs mb-1" />
                        </form>
                        <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-primary" onClick={onSubmit}>{loading ? <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" />
                            <path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                            </path>
                        </svg> : "Add Patient"}
                        </button>
                            <button className="btn">Close</button>
                        </form>
                        </div>
                        
                    </div>
                    </dialog>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Job</th>
                        <th>Favorite Color</th>
                    </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                        <tr key={patient.id}>
                        <th>{patient.name}</th>
                        <th>{patient.age}</th>
                        <th>{patient.biopsis}</th>
                        <th>{patient.phone}</th>
                        <th>{patient.email}</th>
                        <th>{patient.insurance}</th>
                        </tr>)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}