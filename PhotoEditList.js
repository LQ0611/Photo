/**
 * 照片列表
 *
 * add by liqiang 2018-2-1
 * 通过DATA_ID查询
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    ListView,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
    Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import CustomModal from './CustomModal';

//add by liqiang for photo show  2018-2-11
import ZoomImageForShow from './ZoomImageForShow';

import  ImageViewers  from 'react-native-image-zoom-viewer';

const {width, height} = Dimensions.get('window');

import changeJson from './changeJson';

let photoUrls = [];
let photoUrlsJson=[];

class PhotoEditList extends Component {

    constructor(props) {
        super(props);

        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            photoUrls: [],
            _data: [],
            dataSource: ds,
            modalVisibility: false,
            photos: this.props.photos,
            deleteUrls: '',
            isImageShow:false,
            imageIndex:0,
            urlJson:[],
        };
        console.log("photos",this.state.photos);

    }

    componentWillMount() {
        //通过传过来的 ID 去请求照片的连接
        debugger
        console.log("photos1",this.props.photos);
        //photoUrls = this.props.photos;
        this.a();

    }

    componentWillUnmount() {
        photoUrls = [];
    }

     a = ()=> {
        /*let DATA_ID = this.props.todoUrl;
        let result = await Server.getFourthData({DATA_ID});
        if(result._DATA_.noticeOrder.PHONE===  '') {
            return ;
        }
        let photos = result._DATA_.noticeOrder.PHONE.split(',');

        if(photos.length>0){
        photos.forEach((photo) => {
            if(photo.length>0){
            photoUrls.push(Server.root + '/file/' + photo);
            }
        });
        }
        */
        // photoUrls.push('http://d.hiphotos.baidu.com/zhidao/pic/item/bf096b63f6246b60bfac143de9f81a4c500fa2dd.jpg')
        //
        // photoUrls.push('https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3103836023,2868771172&fm=27&gp=0.jpg')

         //photoUrls = this.props.photos;
         console.log("photos2",this.props.photos);
         debugger

    }

    _openMax(source, index) {
        this.setState({
            isImageShow: true,
            imageIndex: index,
        });
        console.log("index",this.state.imageIndex);
    }

    renderListItem = (photoUrl)=> {
        console.log('photoUrl',photoUrl);
        let item = photoUrl.item;
        let index = photoUrl.index;

        console.log('photoUrl',item,index);
        return (
            <View style={{marginTop: 5, marginBottom:5, marginRight: 2.5, marginLeft: 2.5,}}>
                <TouchableOpacity
                    onPress={this._openMax.bind(this,item,index)}
                    onLongPress={this.deletePhoto.bind(this,item)}
                    delayLongPress={1000}
                >
                    <Image
                        source={{uri:item}}
                        style={{width:51,height:51,}}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    deletePhoto = (uri)=> {
        this.setState({
            modalVisibility: true,
            deletePhotoUrl: uri,
        });
    }

    modalLeftButtonClick=()=> {
        this.setState({
            modalVisibility: false,
        });
    }

    modalRightButtonClick=()=> {
        this.setState({
            modalVisibility: false,
        });
        let temp = [];
        photoUrls.forEach((item) => {
            temp.push(item);
        });
        let index = temp.indexOf(this.state.deletePhotoUrl);
        photoUrls.splice(index, 1);
        if(this.state.deletePhotoUrl.indexOf('http') === -1){
            let indexFile = this.state._data.indexOf(this.state.deletePhotoUrl);
            this.setState({
                _data: this.state._data.splice(indexFile, 1),
            });
        } else {
            let deleteUrl = this.state.deletePhotoUrl;
            deleteUrl = deleteUrl.substring(deleteUrl.lastIndexOf('/') + 1) + ',';
            deleteUrl = this.state.deleteUrls + deleteUrl;
            this.setState({
                deleteUrls: deleteUrl
            });
            console.log('deleteUrl',deleteUrl);
            this.props.deletePhotoUrls(deleteUrl);
        }
    }

    openCamera=()=> {
        //在开启相机，拍照时，把照片压缩，而options中的maxWidth，
        // maxHeight为设置的宽和高的最大像素
        const options = {
            title:null,
            cancelButtonTitle:'取消',
            takePhotoButtonTitle:'拍照',
            chooseFromLibraryButtonTitle:'选择相册',
            quality: 1.0,
            maxWidth: 800,
            maxHeight: 800,
            storageOptions: {
                skipBackup: true
            },
        }
        //在ImagePicker组件的launchCamera方法中，加入options参数，
        // 就可将图片压缩为options中相应像素的照片
        ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
                return;
            } else {
                    let  dataArray = this.state._data;
                dataArray.push(response.uri);
                photoUrls.push(response.uri);
                console.log("photoUrls",photoUrls);
                this.setState({
                    _data: dataArray,
                });
                console.log("this.state._data:",this.state._data);

                this.props.callback(photoUrls);
            }
        });
    }

    render() {

        debugger
        console.log("photos1",this.props.photos);
        photoUrls=this.props.photos;
        return (
            <View style={{flexDirection: 'row'}}>
                {
                    this.state.isImageShow ?

                        <Modal visible={true} transparent={true}
                               onRequestClose={()=> {
                                   this.setState({
                                       isImageShow: false,
                                   });
                               }}>

                            <ImageViewers imageUrls={changeJson.Transform(photoUrls)}
                                          onCancel={()=> {
                                              this.setState({
                                                  isImageShow: false,
                                              });
                                          }}

                                          failImageSource={{uri:'./image/posun.png'}}

                                          onClick={()=> {
                                              this.setState({
                                                  isImageShow: false,
                                              });
                                          }}
                                          maxOverflow={width}
                                          flipThreshold={width}

                                          index={this.state.imageIndex}
                                          saveToLocalByLongPress={false}/>
                        </Modal>

                    : null
                }

                {
                    this.state._data.length === 15 ? ( null ) :
                        (
                            <TouchableOpacity
                                onPress={() => this.openCamera()}>
                                <Image
                                    style={{height: 50, width: 50, marginTop: 5, marginBottom:5, marginRight: 2.5, marginLeft: 2.5,}}
                                    source={require('./image/photo.png')}/>
                            </TouchableOpacity>
                        )
                }
                {
                    console.log('photoUrls',this.state.photoUrls)
                }
                <FlatList
                    data={photoUrls}
                    renderItem={(item)=>this.renderListItem(item)}
                    style={{flexDirection: 'row', flexWrap: 'wrap', marginRight: 10}}
                    enableEmptySections={true}
                    horizontal={true}/>

                {
                    <CustomModal title="提示" message="是否确认删除此照片"  ref="_customModal" visibility={this.state.modalVisibility}
                                 onLeftPress={this.modalLeftButtonClick} onRightPress={this.modalRightButtonClick}/>
                }
            </View>
        );
    }
}

export default PhotoEditList;
