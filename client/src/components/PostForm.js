import Axios from 'axios';
import React from 'react'
import {useState} from 'react'

function PostForm() {

    const url = "http://localhost:3001/profiles"
    const [data,setData] = useState({
        name:"",
        email:"",
        contactNumber:""
    })

    function submit(e){
        e.preventDefault();
        Axios.post(url,{
            name:data.name,
            email:data.email,
            contactNumber:data.contactNumber
        })
        .then(res=>{
            console.log(res.data)
        })
    }

    function handle(e){
        const newdata = {...data}
        newdata[e.target.id] = e.target.value
        setData(newdata)
        console.log(newdata)
    }

    return (
        <div>
            {/* craete form for name,email,contactNumber */}
            <form onSubmit={(e)=>submit(e)}>
                <label htmlFor="name">Name</label>
                <input onChange={(e)=>handle(e)} type="text" name="name" id="name" value={data.name}/>
                <label htmlFor="email">email</label>
                <input onChange={(e)=>handle(e)} type="text" name="email" id="email" value={data.email}/>
                <label htmlFor="contactNumber">contactNumber</label>
                <input onChange={(e)=>handle(e)} type="text" name="contactNumber" id="contactNumber" value={data.contactNumber}/>
                <button>Submit</button>
            </form>
        </div>
    )
}

export default PostForm
