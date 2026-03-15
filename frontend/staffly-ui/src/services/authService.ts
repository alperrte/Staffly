import axios from "axios"

const API = axios.create({
    baseURL: "http://localhost:8081/api"
})

export const login = async (email: string,password: string) => {

    const response = await API.post("/auth/login",{
        email,
        password
    })

    return response.data
}