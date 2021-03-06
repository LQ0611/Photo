import React, { Component } from 'react';
import {
    View,
    Text,
    ProgressBarAndroid,
    Modal,
    StyleSheet,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';

export default class Loading extends Component {
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            isShow:true,
        };
    }
    onRequestClose(){
       this.setState({
           isShow:false,
       })
    }

    render() {

        return(
                        <Modal
                            transparent = {true}
                            onRequestClose={()=> this.onRequestClose()}
                        >
                            <View style={styles.loadingBox}>
                                <ActivityIndicator styleAttr='Inverse' color='#1A7DE3' size="small"/>
                            </View>
                        </Modal>

        );
    }

}

const styles = StyleSheet.create({
    loadingBox:{ // Loading居中
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0, 0, 0, 1)' // 半透明
    }
})
