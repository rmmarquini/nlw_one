import axios from 'axios';

const ibgePlaces = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',
});

export default ibgePlaces;