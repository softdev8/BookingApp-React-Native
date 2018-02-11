/**
 * Created by aronclasen on 6/22/17.
 */

const app = {
	base: '#cb2c30',
	background: '#FFFFFF',
	colorPrimary: '#009999',
	colorRed: '#cb2c30',
	cardBackground: '#E9EBEE',
	listItemBackground: '#E9EBEE'
};

const text = {
	textPrimary: '#222222',
	textSecondary: '#777777',
	headingPrimary: brand.brand.primary,
	headingSecondary: brand.brand.primary
};

const brand = {
	brand: {
		primary: '#0E4EF8',
		secondary: '#17233D',
		facebook: '#3b5998',
		twitter: '#4099ff'
	}
};

const borders = {
	border: '#D0D1D5'
};

export default {
	...app,
	...brand,
	...text,
	...borders
};

