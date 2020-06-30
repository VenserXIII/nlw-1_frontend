import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3333"
})
const ibge = axios.create({
  baseURL: "https://servicodados.ibge.gov.br/api/v1"
})

export { api, ibge }
