import fetch from "node-fetch";
import nacl from "tweetnacl";

class Account {

    constructor(main) {
        this.main = main;
    }

    async me() {
        return await this.main.request('GET', '/account.me');
    }

    async balances() {
        return await this.main.request('GET', '/account.balances');
    }

    async submit_deposit() {
        return await this.main.request('POST', '/account.submitDeposit')
    }

    async withdraw(ton_address, currency, amount) {
        let request = {
            'ton_address': ton_address,
            'currency': currency,
            'amount': amount
        }
        let query = this.main.sign_message(request)
        return await this.main.request('POST', '/account.withdraw', json=query)
    }

}

class Cheques {

    constructor(main) {
        this.main = main;
    }

    async cheque_create(currency, amount, expires, description, activates_count, groups_id, personal_id, password) {
        let request = {
            'currency': currency,
            'amount': amount,
            'expires': expires,
            'description': description,
            'activates_count': activates_count,
            'groups_id': groups_id,
            'personal_id': personal_id,
            'password': password
        }
        let query = this.main.sign_message(request)
        return await this.main.request('POST', '/cheque.create', json=query)
    }

    async cheque_status(cheque_id) {
        return await this.main.request('GET', '/cheque.status', params={'cheque_id': cheque_id})
    }

    async cheque_list() {
        return await this.main.request('GET', '/cheque.list')
    }

    async cheque_cancel(cheque_id) {
        return await this.main.request('POST', '/cheque.cancel', json={'cheque_id': cheque_id})
    }

}

class Invoices {

    constructor(main) {
        this.main = main;
    }

    async invoice_create(currency, amount, description, max_payments) {
        let request = {
            'currency': currency,
            'amount': amount,
            'description': description,
            'max_payments': max_payments
        }
        let query = this.main.sign_message(request)
        return await this.main.request('POST', '/invoice.create', json=query)
    }

    async invoice_status(invoice_id) {
        return await this.main.request('GET', '/invoice.status', params={'invoice_id': invoice_id})
    }

    async invoice_list() {
        return await this.main.request('GET', '/invoice.list')
    }

}

class xJetAPI {

    constructor(api_key, private_key=null, host='https://testnet.xjet.app/api/v1') {
        this.api_key = api_key;
        this.private_key = private_key;
        this.host = host;
        this.account = new Account(this);
        this.cheques = new Cheques(this);
    }

    async request(method, endpoint, data={}, params={}) {
        let config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.api_key
            },
        };
        let add = "";

        if (method == "POST") {
            config.body = JSON.stringify(data);
        }

        if (params != {}) {
            add = '?' + ( new URLSearchParams( params ) ).toString()
        }
        
        let host = this.host + endpoint + add;

        console.log(host);
        console.log(config);
        
        return await fetch(host, config).catch(err => {
            console.log(err);
        }).then(res => {
            return res.json().then(json => {
                return json;
            });
        });
    }

    async sign_message(message) {
        if (this.private_key == NaN) return data;
        if (!message.query_id) message.query_id = Math.floor(Date.now() / 1000) + 60 << 16;
        message.signature = nacl.sign(message, this.private_key)._signature.hex();
        return message;
    }

}

const API_KEY = "your api key";
const PRIVATE_KEY = "private key";
let xjet = new xJetAPI(API_KEY, PRIVATE_KEY);

await xjet.account.me().then(res => {
    console.log(res)
});
