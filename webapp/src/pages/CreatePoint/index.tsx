import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import ibgePlaces from '../../services/ibgePlaces';

import './styles.css';

import logo from '../../assets/logo.svg';

/**
 * Interfaces para utilizacao nos estados
 */
interface Item {
    id: number;
    title: string;
    image: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {

    // Constantes de estados referentes a manipulacao da API de maps
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    
    // Constantes de estados referentes aos comportamentos de lista de estados e cidades adquiridos via api IBGE
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    
    // Constante de estados referente aos dados dos inputs do Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wapp: '' 
    });
    
    // Constantes de estado referentes a manipulacao dos seletores de itens de coleta
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // History eh uma funcao para retornar o usuario a uma rota definida, rapidamente
    const history = useHistory();
    
    // Hook para setar a coordenada informada pelo usuario
    useEffect( () => {
        navigator.geolocation.getCurrentPosition(position => {
            let { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    // Hook para obter os itens de coleta da RESTful API
    useEffect( () => {
        api.get('items')
            .then(res => {
                setItems(res.data);
            })
            .catch(err => {
                console.error(err.statusText);
            });
    }, []);

    // Hook para obter as UFs atraves da requisicao feita na API IBGE
    useEffect( () => {
        ibgePlaces.get<IBGEUFResponse[]>('/estados?orderBy=nome')
            .then(res => {
                let ufInitials = res.data.map(uf => uf.sigla);
                setUfs(ufInitials);
            })
            .catch(err => {
                console.error(JSON.stringify(err));
            });
    }, []);

    // Hook para obter os municipios atraves da requisicao feita na API IBGE
    useEffect( () => {
        if (selectedUf === '0') return;

        ibgePlaces.get<IBGECityResponse[]>(`/estados/${selectedUf}/municipios?orderBy=nome`)
            .then(res => {
                let cityNames = res.data.map(city => city.nome);
                setCities(cityNames);
            })
            .catch(err => {
                console.error(JSON.stringify(err));
            })

    }, [selectedUf]);

    /**
     * Funcao para definir a lista de UFs 
     * @param event 
     */
    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        let uf = event.target.value;
        if (uf === "0") {
            setCities([]);
            setSelectedCity("0");
        }
        setSelectedUf(uf);
    }

    /**
     * Funcao para definir a lista de municipios
     * @param event 
     */
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        let city = event.target.value;
        setSelectedCity(city);
    }

    /**
     * Funcao para definir a coordenada selecionada pelo usuario
     * @param event 
     */
    function handleMapMarker(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    /**
     * Funcao para definir as informacoes preenchidas pelo usuario nos inputs
     * Ao alterar o estado pelo setFormData, atraves do spread operator, eh 
     * feita verificacao pela chave-valor do obj para nao escrever valor incorreto
     * na chave errada.
     * @param event 
     */
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        let { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    /**
     * Funcao para definir os itens de coleta selecionados pelo usuario
     * Se o item estiver selecionado, o spread operator, garante que se id
     * nao sera sobrescrito qdo o estado for alterado. Caso um item for 
     * desmarcado, atraves do metodo filter, garantimos que os demais itens
     * nao sejam sobrescritos na alteracao do estado.
     * @param id 
     */
    function handleSelectedItem(id: number) {
        let alreadySelected = selectedItems.findIndex(item => item === id);
        if (alreadySelected >= 0) {
            let filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([ ...selectedItems, id ]);
        }
    }

    /**
     * Funcao para enviar os dados via POST a API RESTful e cadastrar
     * o ponto de coleta na base de dados
     * Uma mesagem de retorno eh exibida se houver sucesso ou falha
     * Se sucesso, redireciona o usuario para a pagina inicial
     * @param event 
     */
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        let { name, email, wapp } = formData;
        let uf = selectedUf;
        let city = selectedCity;
        let [latitude, longitude] = selectedPosition;
        let items = selectedItems;

        let data = {
            name,
            email,
            wapp,
            latitude,
            longitude,
            city,
            uf,
            items
        }

        await api.post('points', data);
        alert('cadastro realizado');

        // TODO: mensagem de retorno

        history.push('/');

    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br />ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text" 
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email" 
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="wapp">Whatsapp</label>
                            <input 
                                type="text" 
                                name="wapp"
                                id="wapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapMarker}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">UF</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectedUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;