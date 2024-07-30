'use client'

import { firestore, storage } from '@/firebase';
import useSelectFile from '@/hooks/useSelectFile';
import { User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState } from 'react';

type PatientScansProps = {
    patientId: string
    user: User | null | undefined
};

type Scan = {
    id: string,
    scanDate: Date | undefined,
    biopsyType: string,
    pathologist: string,
    aiDiagnosis?: string,
    imageURL?: string,
}

const PatientScans:React.FC<PatientScansProps> = ({patientId, user}) => {
    const bgColor = {
        // default: '',
        ["No Scans" as any]: 'text-base',
        ["Clear" as any]: 'text-green-500',
        ["Cancer" as any]: 'text-red-500',

    }
    
    
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [scanForm, setScanForm] = useState({
        scanDate: undefined,
        biopsyType: '',
        pathologist: 'No Diagnosis'
    })

    const [scans, setScans] = useState<Scan[]>([])
    
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    
    const onChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        setScanForm((prev) => ({
          ...prev,
          [event.target.name]: event.target.value,
        }));
    };

    const onSubmit = async () => {
        setLoading(true);
        setError('')

        const dialog = document.getElementById('addscan') as HTMLDialogElement;

        if (user) {

            try {
            if (!selectedFile){
                throw new Error('No Image Attached!')
            }
            
            const scanDocRef = doc(collection(firestore, "users", user.uid, 'patients', patientId, 'scans'))
            const imageRef = ref(storage, `scans/${scanDocRef.id}/image`);
            await uploadString(imageRef, selectedFile, "data_url");
            const downloadURL = await getDownloadURL(imageRef);
            const scanData = {
                ...scanForm,
                id:scanDocRef.id,
                aiDiagnosis: "Loading..",
                imageURL: downloadURL
            }
            await setDoc(scanDocRef, JSON.parse(JSON.stringify(scanData)));

            setScans([...scans, scanData])

            } catch (error: any) {
            console.log("addScan error", error.message);
            setError(error.message);
            setLoading(false);
            }
        }else{
            setError("No User")
            setLoading(false);
        }
        if(error == ''){
            dialog.close()
            setScanForm({scanDate: undefined, biopsyType: '', pathologist:''})
            setSelectedFile('')
        }
        setLoading(false);
    }

    const onUpdate = async (scan: Scan) => {
        setLoading(true);
        const dialog = document.getElementById(scan.id) as HTMLDialogElement;
        
        if (user) {

            try {
            
            
            const scanDocRef = doc(firestore, "users", user.uid, 'patients', patientId, 'scans', scan.id)
            const scanData = {
                ...scanForm,
            }
            await updateDoc(scanDocRef, JSON.parse(JSON.stringify(scanData)));
            if(selectedFile){
                const imageRef = ref(storage, `scans/${scanDocRef.id}/image`);
                await uploadString(imageRef, selectedFile, "data_url");
                //update post with URL
                const downloadURL = await getDownloadURL(imageRef);
    
                await updateDoc(scanDocRef, {
                imageURL: downloadURL,
                });
            }
            const currentScanIndex = scans.findIndex((scan1) => scan1.id === scan.id);
            // 2. Mark the todo as complete
            const updatedTodo = {...scans[currentScanIndex], ...scanData};
            // 3. Update the todo list with the updated todo
            const newTodos = [
                ...scans.slice(0, currentScanIndex),
                updatedTodo,
                ...scans.slice(currentScanIndex + 1)
            ];
            setScans(newTodos);
            } catch (error: any) {
            console.log("updateScan error", error.message);
            setError(error.message);
            setLoading(false);
            }
        }else{
            setError("No User")
            setLoading(false);
        }
        if(error == ''){
            dialog.close()
            setScanForm({scanDate: undefined, biopsyType: '', pathologist:''})
            setSelectedFile('')
        }
        setLoading(false);
    }

    useEffect(()=>{
        const getScans = async () =>{
            if (user) {
                const querySnapshot = await getDocs(collection(firestore, "users", user.uid, "patients", patientId, "scans"));
                querySnapshot.forEach((doc) => {
                    setScans(prevScans => [...prevScans, doc.data() as Scan]);
                });
            } else {
                console.log('no user')
            }  
        }
        if(scans.length == 0){
            getScans()
        }
    }, [user])

    return(
        <>
        <div className="">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-medium">Biopsy Scans</h2>
                <div>
                    {/* Open the modal using document.getElementById('ID').showModal() method */}
                    <button className="btn btn-primary" onClick={() => {
                    const dialog = document.getElementById('addscan') as HTMLDialogElement;
                    dialog.showModal();
                    }}>Add Biopsy</button>
                    <dialog id="addscan" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Add Biopsy</h3>
                        <form className="py-2">
                            <p className="my-2">Scan Date</p>
                            <input name="scanDate" onChange={onChange} type="date" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Biopsy Type</p>
                            <select name="biopsyType" onChange={onChange} className="select select-bordered w-full max-w-xs flex items-center gap-2">
                                <option disabled selected>Biopsy Type</option>
                                <option value={'FNA'}>FNA</option>
                                <option value={'Core Needle'}>Core Needle</option>
                                <option value={'Open'}>Open</option>
                            </select>
                            <p className="my-2">Pathologist Diagnosis</p>
                            <select name="pathologist" onChange={onChange} className="select select-bordered w-full max-w-xs flex items-center gap-2">
                                <option disabled selected>Biopsy Type</option>
                                <option value={'No Diagnosis'}>Not Diagnosed Yet</option>
                                <option value={'Clear'}>Clear</option>
                                <option value={'Cancer'}>Cancer</option>
                            </select>
                            <p className="my-2">Biopsy Image</p>
                            <input name="pfp" accept="image/png, image/jpeg" onChange={onSelectFile} type="file" className="file-input file-input-bordered w-full max-w-xs mb-1" />
                            {error && <p className="text-red-600">{error}</p>}
                        </form>
                        <div className="modal-action">
                        <button onClick={onSubmit} className="btn btn-primary">{loading ? <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" />
                            <path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                            </path>
                        </svg> : "Add Biopsy"}
                        </button>
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                        </div>
                        
                    </div>
                    </dialog>
                </div>
            </div>
            <div className="overflow-x-auto bg-base-200 rounded-lg">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th>Scan Date</th>
                        <th>Biopsy Type</th>
                        <th>Pathologist Diagnosis</th>
                        <th>AI Diagnosis</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scans.map((scan, index) => (
                        <>
                        <tr key={scan.id} className=" hover:bg-base-100 cursor-pointer" onClick={() => {
                            const dialog = document.getElementById(scan.id) as HTMLDialogElement;
                            dialog.showModal();
                            setScanForm({scanDate: scan.scanDate as any, biopsyType: scan.biopsyType, pathologist: scan.pathologist})
                            }}>
                        <th>{scan.scanDate?.toString()}</th>
                        <th>{scan.biopsyType}</th>
                        <th className={bgColor[scan.pathologist as any]}>{scan.pathologist}</th>
                        <th className={bgColor[scan.aiDiagnosis as any]}>{scan.aiDiagnosis}</th>
                        </tr>
                        <dialog id={scan.id} className="modal">
                        <div className="modal-box max-w-[40rem]">
                            <h3 className="font-bold text-lg">Biopsy on {scan.scanDate?.toString()}</h3>
                            <div className='flex lg:flex-row md:flex-row flex-col'>
                            <a className='flex w-[250px] h-[250px] mr-4' target='_blank' href={scan.imageURL}>
                            <img className='w-[250px] h-[250px] rounded-lg mt-2' src={scan.imageURL}/>
                            </a>
                            <form className="">
                            <p className="my-2">Scan Date</p>
                            <input name="scanDate" onChange={onChange} type="date" className="input input-bordered w-full max-w-xs mb-1" />
                            <p className="my-2">Biopsy Type</p>
                            <select name="biopsyType" onChange={onChange} className="select select-bordered w-full max-w-xs flex items-center gap-2">
                                <option disabled selected>Biopsy Type</option>
                                <option value={'FNA'}>FNA</option>
                                <option value={'Core Needle'}>Core Needle</option>
                                <option value={'Open'}>Open</option>
                            </select>
                            <p className="my-2">Pathologist Diagnosis</p>
                            <select name="pathologist" onChange={onChange} className="select select-bordered w-full max-w-xs flex items-center gap-2">
                                <option disabled selected>Biopsy Type</option>
                                <option value={'No Diagnosis'}>Not Diagnosed Yet</option>
                                <option value={'Clear'}>Clear</option>
                                <option value={'Cancer'}>Cancer</option>
                            </select>
                            <p className="my-2">Biopsy Image</p>
                            <input name="pfp" accept="image/png, image/jpeg" onChange={onSelectFile} type="file" className="file-input file-input-bordered w-full max-w-xs mb-1" />
                            {error && <p className="text-red-600">{error}</p>}
                            </form>
                            </div>
                            <div className="modal-action">
                            <button onClick={()=>onUpdate(scan)} className="btn btn-primary">{loading ? <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" />
                            <path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                            </path>
                            </svg> : "Update Biopsy"}
                            </button>
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn">Close</button>
                            </form>
                            </div>
                        </div>
                        </dialog>
                        </>
                        )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}
export default PatientScans;