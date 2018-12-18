import { Component } from "@stencil/core";

@Component({
	tag: 'ms-spinner',
	styleUrl: './spinner.css',
	shadow: true
})
export class Spinner {

	render() {
		return(
			<div class="lds-ring">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		);
	}
}
