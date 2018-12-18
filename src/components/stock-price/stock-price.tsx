import {Component, Listen, Prop, State, Watch} from "@stencil/core";

import { AV_API_KEY } from '../../global/global';

@Component({
	tag: 'ms-stock-price',
	styleUrl: './stock-price.css',
	shadow: true
})
export class StockPrice {

	stockInput: HTMLInputElement;

	@State() price: number;
	@State() stockUserInput: string;
	@State() stockInputValid = false;
	@State() error: string;
	@State() loading = false;

	@Prop({ mutable: true, reflectToAttr: true }) stockSymbol: string;

	@Watch('stockSymbol')
	stockSymbolChanged(newValue: string, oldValue: string) {
		if (newValue !== oldValue) {
			this.stockUserInput = newValue;
			this.stockInputValid = true;
			this.fetchStockPrice(newValue);
		}
	}

	onUserInput(event: Event) {
		this.stockUserInput = (event.target as HTMLInputElement).value;
		if (this.stockUserInput.trim() !== '') {
			this.stockInputValid = true;
		} else {
			this.stockInputValid = false;
		}
	}

	onFetchStockPrice(event: Event) {
		event.preventDefault();
		this.stockSymbol = this.stockInput.value;
	}

	componentDidLoad() {
		if (this.stockSymbol) {
			this.stockUserInput = this.stockSymbol;
			this.stockInputValid = true;
			this.fetchStockPrice(this.stockSymbol);
		}
	}

	@Listen('body:msSymbolSelected')
	onStockSymbolSelected(event: CustomEvent) {
		console.log('stock symbol selected: ' + event.detail);
		if (event.detail && event.detail !== this.stockSymbol) {
			this.stockSymbol = event.detail;
		}
	}

	fetchStockPrice(stockSymbol: string) {
		this.loading = true;

		fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
			.then(res => {
				if (res.status !== 200) {
					throw new Error('Invalid!');
				}
				return res.json();
			})
			.then(data => {

				if (!data['Global Quote']['05. price']) {
					throw new Error('Invalid symbol!');
				}

				this.error = null;
				this.price = +data['Global Quote']['05. price'];
				this.loading = false;
			})
			.catch(err => {
				this.error = err.message;
				this.price = null;
				this.loading = false;
			});
	}

	hostData() {
		return { class: this.error ? 'error' : '' };
	}

	render() {
		let dataContent = <p>Please enter a symbol!</p>;
		if (this.error) dataContent = <p>{ this.error }</p>;
		if (this.price) dataContent = <p>Price: ${ this.price }</p>;
		if (this.loading) dataContent = <ms-spinner></ms-spinner>;

		return [
			<form onSubmit={this.onFetchStockPrice.bind(this)}>
				<input
					id="stock-symbol"
					type="text"
					ref={el => this.stockInput = el}
					value={this.stockUserInput}
					onInput={this.onUserInput.bind(this)} />
				<button type="submit" disabled={!this.stockInputValid || this.loading}>Fetch</button>
			</form>,
			<div>
				{ dataContent }
			</div>
		];
	}
}
