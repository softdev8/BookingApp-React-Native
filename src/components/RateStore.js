import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import {fetchBranches} from '../actions';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {connect} from 'react-redux';
import SearchBar from 'react-native-searchbar'

class RateStore extends Component {
	constructor(props) {
		super(props);

		this.state = {
			branches: props.branches,
			rateCriteria: [],
			loading: false,

		};

		this.retrieveRatingCriteria = this.retrieveRatingCriteria.bind(this);
		this.retrieveBranches = this.retrieveBranches.bind(this);
	}

	componentDidMount() {
		this.setState({loading: true});
		this.retrieveRatingCriteria();
	}

	retrieveRatingCriteria() {
		let _this = this;
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveRatingCriteria',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Fetch Rating Criteria Success=================");
					_this.setState({rateCriteria: response.data});
					if (_this.state.branches.length === 0) {
						_this.retrieveBranches();
					} else {
						_this.setState({loading: false});
					}
				}
			)
			.catch(
				function (error) {
					console.log("=================Fetch Rating Criteria FAILED=================");
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'rateStore' });
            return;
          }
					setTimeout(()=> {
						Alert.alert(
							'Fetch Error',
							'Failed to fetch Rating Criteria...',
							[
								{text: 'OK', onPress: () => console.log('OK Pressed')},
							],
							{ cancelable: false }
						);
					}, 200);
				}
			);
	}
	
	onSelectStore(index) {
		const store = this.state.branches[index];
		Actions.storeDetail({title: store.BranchName, branch: store, criteria: this.state.rateCriteria});
	}

	retrieveBranches() {
		let _this = this;
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveBranches',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Fetch Branches Success=================");
					_this.setState({branches: response.data, loading: false});
					_this.props.fetchBranches(response.data);
				}
			)
			.catch(
				function (error) {
					console.log("=================Fetch Branches FAILED=================");
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'rateStore' });
            return;
          }
					setTimeout(()=> {
						Alert.alert(
							'Fetch Error',
							'Failed to Collect Stores...',
							[
								{text: 'OK', onPress: () => console.log('OK Pressed')},
							],
							{ cancelable: false }
						);
					}, 200);
				}
			);
	}
	
	handleSearchResults(input) {
		if (!input) {
			this.setState({branches: this.props.branches});
		} else {
			let branches = [];
			this.props.branches.map((branch) => {
				if (branch.BranchName.toLowerCase().indexOf(input.toLowerCase()) >= 0 ) {
					branches.push(branch);
				}
			});
			
			this.setState({branches});
		}
		
	}

	render() {
		const {branches} = this.state;

		return (
		<View style={{flex: 1, marginTop: AppSizes.navbarHeight}}>
			<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
			{
				this.props.branches.length > 0 ?
					<SearchBar
						ref={(ref) => this.searchBar = ref}
						data={this.props.branches}
						handleSearch={this.handleSearchResults.bind(this)}
						iOSPadding={false}
						showOnLoad
						hideBack
					/>
					: null
			}
			
			<ScrollView style={[AppStyles.navContainer, styles.container]}>
				{
					branches.map((branch, index) => {
						return (
							<TouchableOpacity key={branch.Id}
							                  onPress={ () => this.onSelectStore(index) }
							>
								<View style={[AppStyles.row, styles.storeListView ]}>
									<View style={styles.branchContainer}>
										<View style={AppStyles.row}>
											<Icon name="book" style={styles.iconBig} />
											<Text style={styles.branchName}> {branch.BranchName} </Text>
										</View>
										
										<View style={AppStyles.row}>
											<Icon name="phone" style={styles.iconCommon} />
											<Text style={styles.commonText}> {branch.Telephone} </Text>
										</View>
										
										<View style={AppStyles.row}>
											<Icon name="envelope-o" style={styles.iconCommon} />
											<Text style={styles.commonText}> {branch.Email} </Text>
										</View>
										
										<View style={AppStyles.row}>
											<Icon name="user" style={styles.iconCommon} />
											<Text style={styles.colorPrimary}> {branch.ManagerName} </Text>
										</View>
									</View>
									
									<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />
								</View>
							</TouchableOpacity>
						)
					})
				}
			</ScrollView>
		</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 8,
		backgroundColor: AppColors.background
	},

	

	branchContainer: {
		flex: 1,
	},
iconBig: {
		width: 18,
		fontSize: 14,
		marginTop: 4,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},

	iconCommon: {
		width: 18,
		fontSize: 12,
		marginTop: 3,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},
	branchName: {
		fontSize: 16,
		color: AppColors.textPrimary,
	},

	commonText: {
		color: AppColors.textSecondary,
	},

	colorPrimary: {
		color: AppColors.colorPrimary,
	},

	storeListView: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 8,
		borderColor: AppColors.listItemBackground,
		borderBottomWidth: 1,
	}

});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
		branches: state.data.branches
	};
};

export default connect(mapStateToProps, {fetchBranches})(RateStore);
