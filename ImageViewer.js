import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    ListView,
    FlatList,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import  ImageViewers  from 'react-native-image-zoom-viewer';

import changeJson from './changeJson';
import LoadingForShow from './LoadingForShow';

import CustomModal from './CustomModal';

//add by liqiang for photo show  2018-2-11
import ZoomImageForShow from './ZoomImageForShow';

import ImageView from  'react-native-image-zoom-viewer';

const {width, height} = Dimensions.get('window');

let photoUrls = [];

class ImageViewer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            imageArrays:this.props.photos,
            isImageShow:false,
            imageIndex:0,
        };
        console.log("imageArrays:",this.state.imageArrays);

    }

    componentWillMount() {

    }

    componentWillUnmount() {
        photoUrls = [];
    }

    _openMax(source, index) {
        this.setState({
            isImageShow: true,
            imageIndex: index,
        });
        console.log("index",this.state.imageIndex);
    }

    renderListItem(items) {

        let item = items.item;
        let index = items.index;

        console.log('photoUrl',item,index);
        return (
            <View style={{marginTop: 5, marginBottom:5, marginRight: 2.5, marginLeft: 2.5,}}>
                <TouchableOpacity onPress={this._openMax.bind(this,item,index)}>
                    <Image
                        source={{uri:item}}
                        style={{width:51,height:51,}}
                    />
                </TouchableOpacity>
            </View>
        );
    }


    render() {
        return (
            <View style={{flexDirection: 'row'}}>

                {this.state.isImageShow ?
                    <TouchableOpacity
                        onPress={()=>{
                            this.setState({
                                isImageShow: false,
                            })
                        }}
                    >
                    <Modal visible={true} transparent={true}
                           onRequestClose={()=> {
                               this.setState({
                                   isImageShow: false,
                               });
                           }}>
                        <ImageViewers imageUrls={changeJson.Transform(this.state.imageArrays)}
                                     onCancel={()=> {
                                         this.setState({
                                             isImageShow: false,
                                         });
                                     }}

                                      failImageSource={{uri:'./image/posun.png'}}

                                      maxOverflow={width}
                                      flipThreshold={width}


                                      onClick={()=> {
                                          this.setState({
                                              isImageShow: false,
                                          });
                                      }}
                                     index={this.state.imageIndex}
                                     saveToLocalByLongPress={false}/>
                    </Modal>
                    </TouchableOpacity>
                    : null}

                <FlatList
                    data={this.state.imageArrays}
                    renderItem={(item)=>this.renderListItem(item)}
                    style={{flexDirection: 'row', flexWrap: 'wrap', marginRight: 10}}
                    horizontal={true}/>
            </View>
        );
    }
}

export default ImageViewer;