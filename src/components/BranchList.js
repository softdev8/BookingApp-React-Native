import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import {changeBranch} from '../actions';
import {Actions} from 'react-native-router-flux';
import SearchBar from 'react-native-searchbar'

class BranchList extends Component {

	constructor(props) {
		super(props);
		
		this.state = {
			branches: props.branches
		};

		this.onSelectBranch = this.onSelectBranch.bind(this);
	}

	onSelectBranch(index) {
		this.props.changeBranch(this.props.branches[index]);
		Actions.pop({refresh: {branch: this.props.branches[index]}})
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
				<ScrollView style={AppStyles.navContainer}>
					{
						branches.map((branch, index) => {
							return (
								<TouchableOpacity key={branch.Id}
								                  onPress={ () => this.onSelectBranch(index) }
								>
									<View style={[AppStyles.row, {justifyContent: 'center', alignItems: 'center', padding: 8, borderColor: AppColors.listItemBackground, borderBottomWidth: 1}]}>
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

	listContainer: {
		flex: 1
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

	branchName: {
		fontSize: 16,
		color: AppColors.textPrimary,
	},

	commonText: {
		color: AppColors.textSecondary,
	}

});

const mapStateToProps = (state) => {
	return {
		branches: state.data.branches,
		branch: state.data.branch
	};
};

export default connect(mapStateToProps, {changeBranch})(BranchList);