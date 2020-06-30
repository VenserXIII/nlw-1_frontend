import React, { useState, useEffect, FormEvent, ChangeEvent } from "react"
import { Link, useHistory } from "react-router-dom"
import { Map, TileLayer, Marker } from "react-leaflet"
import { LeafletMouseEvent } from "leaflet"

import { api, ibge } from "../../services/api"

import { FiArrowLeft } from "react-icons/fi"
import logo from "../../assets/logo.svg"
import "./styles.css"

const CreatePoint = () => {

  const history = useHistory()

  // #region Interfaces
  interface Items {
    id: number
    title: string
    image: string
  }
  interface UFResponse {
    sigla: string
  }
  interface CityResponse {
    nome: string
  }
  // #endregion

  // #region States
  const [items, setItems] = useState<Items[]>([])

  const [formInputs, setFormInputs] = useState({ name: "", email: "", whatsapp: "" })
  const [ufs, setUFs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedUF, setSelectedUF] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  
  const [initialCoords, setInitialCoords] = useState<[number, number]>([-13.705, -49.646])
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([0, 0])
  const [zoom, setZoom] = useState<number>(12)
  // #endregion

  // #region Effects
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords }) => setInitialCoords([coords.latitude, coords.longitude]), err => { console.log(err); setZoom(4) })
    ibge.get<UFResponse[]>("/localidades/estados?orderBy=nome").then(({ data }) => setUFs(data.map(i => i.sigla)))
    api.get("/items").then(({ data }) => setItems(data))
  }, [])

  // Renders new cities on UF change
  useEffect(() => {
    if (selectedUF) {
      ibge.get<CityResponse[]>(`/localidades/estados/${selectedUF}/municipios`).then(({ data }) => setCities(data.map(i => i.nome)))
    }
  }, [selectedUF])
  // #endregion

  // #region Handlers
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { name, email, whatsapp } = formInputs
    const uf = selectedUF
    const city = selectedCity
    const items = selectedItems
    const [latitude, longitude] = selectedCoords
    await api.post("/point", { name, email, whatsapp, uf, city, latitude, longitude, items }).then(res => { alert("Ponto de coleta criado com sucesso!"); history.push("/") })
  }
  function handleInputs(e: ChangeEvent<HTMLInputElement>) {
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value })
  }
  function handleMapClick(e: LeafletMouseEvent) {
    setSelectedCoords([e.latlng.lat, e.latlng.lng])
  }
  function handleUF(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedUF(e.target.value)
  }
  function handleCity(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(e.target.value)
  }
  function handleItems(id: number) {
    selectedItems.findIndex(i => i === id) >= 0 ? setSelectedItems(selectedItems.filter(i => i !== id)) : setSelectedItems([...selectedItems, id])
  }
  // #endregion

  return (
    <div className="create-parent">
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />
          <Link to="/" ><FiArrowLeft />Voltar para Home</Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>Cadastro do ponto de coleta</h1>
          <fieldset>
            <legend className="field-flex"><h2>Dados</h2></legend>
            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input type="text" name="name" id="name" pattern=".*\S.*" required onChange={handleInputs} />
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="name">E-mail</label>
                <input type="email" name="email" id="email" pattern=".*\S.*" required onChange={handleInputs} />
              </div>
              <div className="field">
                <label htmlFor="name">Whatsapp</label>
                <input type="text" name="whatsapp" id="whatsapp" pattern=".*\S.*" required onChange={handleInputs} />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="field-flex">
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </div>
            <Map center={initialCoords} zoom={zoom} onClick={handleMapClick}>
              <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {initialCoords && (
                <Marker position={selectedCoords} />
              )}
            </Map>
            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" value={selectedUF} required onChange={handleUF}>
                  <option value="" hidden>Selecione uma UF</option>
                  {ufs.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" value={selectedCity} required onChange={handleCity}>
                  <option value="" hidden>Selecione uma Cidade</option>
                  {cities.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="field-flex">
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </div>
            <ul className="items-grid">
              {items.map(i => (
                <li key={i.id} className={selectedItems?.includes(i.id) ? "selected" : ""} onClick={() => handleItems(i.id)}>
                  <img src={i.image} alt={i.title}/>
                  <span>{i.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </div>
  )
}

export default CreatePoint
