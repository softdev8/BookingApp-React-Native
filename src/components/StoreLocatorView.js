import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Platform, View, Text, StyleSheet, TouchableOpacity, ListView, Alert, Picker} from 'react-native';
import {AppColors, AppConstants, AppStyles, AppSizes, AppErrors} from '../constants';
import Spinner from 'react-native-loading-spinner-overlay';

import {fetchBranches, openTab, updateSearchFilter} from '../actions';

import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import SearchBar from 'react-native-searchbar'
import {Actions} from 'react-native-router-flux';

// import Modal from '../libs/ModalBox';
// import SearchFilterModal from './common/SearchFilterModal';


const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class StoreLocatorView extends Component {
	
	constructor(props) {
		super();
		
		let defaultStore = props.branches.length > 0 ? props.branches[0] : null;
		let lat = -33.9249, long = 18.4241;
		if (defaultStore) {
			lat = Number(defaultStore.Coordinates.split(",")[0]);
			long = Number(defaultStore.Coordinates.split(",")[1]);
		}
		
		this.state = {
			dataSource: ds.cloneWithRows(props.branches),
			loading: false,
			branches: props.branches,
			selectedStore: null,
			latitude: lat,
			longitude: long,


		};
  }

	renderRightButton = () => {
    return(
			<TouchableOpacity onPress={() => this.showFilters() } >
				<Icon name="filter" style={styles.rightButton} />
			</TouchableOpacity>
    );
  };


  componentWillMount() {
    Actions.refresh({ renderRightButton: this.renderRightButton });
  }


  closeModal () {
		this.props.closeModal("storeLocator");
	}
	
	componentWillReceiveProps(nextProps) {
		const { searchFilters, sourceSceneKey } = nextProps;
		console.log(searchFilters, sourceSceneKey);
		if (sourceSceneKey === 'searchFilterView') {
			this.setState({
				dataSource: ds.cloneWithRows(this.applyFilter(this.state.branches, searchFilters)),
			});
		}
  }

	componentDidMount() {
		if (this.state.branches.length === 0) {
      this.retrieveBranches();
		} else {
			this.updateFilter(this.state.branches);
		}
	}

	retrieveBranches() {
		let _this = this;
		const headers = {
			'Authorization': this.props.token
		};
		this.setState({loading: true});
		
		axios.get(
			AppConstants.BASE_URL + 'retrieveBranches',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Fetch Branches Success=================");
					// console.log(response.data);
					_this.setState({
						branches: response.data,
						loading: false,
						dataSource: ds.cloneWithRows(response.data),
						latitude: Number(response.data[0].Coordinates.split(",")[0]),
						longitude: Number(response.data[0].Coordinates.split(",")[1]),
						selectedStore: response.data[0],
					});
					_this.props.fetchBranches(response.data);
          _this.updateFilter(response.data);
				}
			)
			.catch(
				function (error) {
					console.log("=================Fetch Branches FAILED=================");
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'storeLocator' });
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


	updateFilter(branches) {
  	const filters = this.props.searchFilters;

    branches.map(branch => {
      if (typeof filters.City[branch.City] === 'undefined') {
        filters.City[branch.City] = false;
      }
      if (typeof filters.Province[branch.Province] === 'undefined') {
        filters.Province[branch.Province] = false;
      }
    });

		this.props.updateSearchFilter(filters);
	}

  onSelectStore(branch) {
    this.props.openTab({
    	name: 'mapView',
			branch,
    });
    // this.refs.storeMapModal.open();
  }

  applyFilter(branches, filters) {
  	const regionFilter = Object.keys(filters.Region).filter(key => filters.Region[key]);
    const cityFilter = Object.keys(filters.City).filter(key => filters.City[key]);
    const provinceFilter = Object.keys(filters.Province).filter(key => filters.Province[key]);

    return branches.filter(branch => {
  		const a = !regionFilter.length || regionFilter.indexOf(branch.Region) !== -1;
      const b = !cityFilter.length || cityFilter.indexOf(branch.City) !== -1;
      const c = !provinceFilter.length || provinceFilter.indexOf(branch.Province) !== -1;
			return a && b && c;
		});
	}

  handleSearchResults(input) {
    const filters = this.props.searchFilters;


		if (!input) {
			this.setState({dataSource: ds.cloneWithRows(this.applyFilter(this.state.branches, filters))});
		} else {
			let branches = [];
      this.applyFilter(this.props.branches, filters).map((branch) => {
				if (branch.BranchName.toLowerCase().indexOf(input.toLowerCase()) >= 0 ) {
					branches.push(branch);
				}
			});
			
			this.setState({dataSource: ds.cloneWithRows(branches)});
		}
	}

  showFilters() {
    // this.refs.searchFilterModal.open();
		Actions.searchFilterView({ filters: this.props.searchFilters });
  }

  onSubmitSuccess(filters) {
    this.refs.searchFilterModal.close();
    const filteredBranches = this.props.branches.filter(branch => {
    	return filters.Region.ALL || filters.Region[branch.Region];
    });

    this.setState({
      dataSource: ds.cloneWithRows(filteredBranches),
      filters,
    });
  }

  onSubmitFailed() {
    this.refs.searchFilterModal.close();
  }

  render() {
		// const {filters} = this.state;


		return (
			<View style={{flex: 1, marginTop: AppSizes.navbarHeight, flexDirection: 'column'}}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>


				{/*<Modal*/}
					{/*ref={"searchFilterModal"}*/}
					{/*position={"top"}*/}
					{/*style={[AppStyles.modal, {marginTop: 100, height: 330}]}*/}
				{/*>*/}
					{/*<SearchFilterModal*/}
						{/*filters={filters}*/}
						{/*onSubmitSuccess={this.onSubmitSuccess.bind(this)}*/}
						{/*onSubmitFailed={this.onSubmitFailed.bind(this)}*/}
					{/*/>*/}
				{/*</Modal>*/}


				<View>
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
				</View>
				<ListView
					style={[styles.container, {marginTop: 53}]}
					dataSource={this.state.dataSource}
					enableEmptySections
					renderRow={
						(branch) => {
							return (
								<TouchableOpacity key={branch.Id}
								                  onPress={ () => this.onSelectStore(branch) }
								>
									<View style={[AppStyles.row, styles.branchInfoContainer]}>
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

											<View style={AppStyles.row}>
												<Icon name="location-arrow" style={styles.iconCommon} />
												<Text style={styles.commonText}> {branch.Region} </Text>
											</View>


											<View style={AppStyles.row}>
												<Icon name="clock-o" style={styles.iconCommon} />
												<Text
													style={[{fontWeight: 'bold'}, branch.Status == "OPEN" ? styles.colorPrimary : styles.colorBase]}>{branch.Status}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Monday</Text>
												<Text style={[styles.colorCommon]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.MondayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Tuesday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.TuesdayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Wednesday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.WednesdayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Thursday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.ThursdayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Friday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.FridayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Saturday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.SaturdayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Sunday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.SundayHours.toUpperCase()}</Text>
											</View>

											<View style={[AppStyles.row, {paddingHorizontal: 8, paddingVertical: 2}]}>
												<Text style={[styles.colorCommon, styles.weekday]}>Public Holiday</Text>
												<Text style={[styles.colorCommon ]}>: </Text>
												<Text style={[styles.colorPrimary, styles.workHour]}>{branch.PublicHolidayHours.toUpperCase()}</Text>
											</View>

										</View>

										<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />
									</View>
								</TouchableOpacity>
							)
						}
					}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({

	

	container: {
		flex: 1,
	},
	navHeader: {
		height: AppSizes.navbarHeight,
		backgroundColor: AppColors.base,
		...Platform.select({
			ios: {
				paddingTop: 22,
			},
			android: {
				paddingTop: 0,
			},
			vr: {
				paddingTop: 0,
			}
		})
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
	
	branchContainer: {
		flex: 1,
	},

	branchInfoContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 8,
		borderColor: AppColors.listItemBackground,
		borderBottomWidth: 1,
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
	
	mapView: {
		...StyleSheet.absoluteFillObject
	},

  leftButton: {
    fontSize: 22,
    color: 'white',
    marginLeft: 10,
  },

  rightButton: {
    fontSize: 22,
    color: 'white',
    marginRight: 10,
  },

  colorCommon: {
    color: AppColors.textPrimary
  },
  weekday: {
    width: 110
  },

  workHour: {
    paddingLeft: 12,
  },
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
		branches: state.data.branches,
    searchFilters: state.data.searchFilters,
    sourceSceneKey: state.routes.sourceSceneKey
  };
};


export default connect(mapStateToProps, {fetchBranches, openTab, updateSearchFilter})(StoreLocatorView);
