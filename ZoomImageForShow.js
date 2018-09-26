/**
 * Created by liqiang on 2018-2-11.
 *
 *
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Image,
    Modal,
    Easing,
    StyleSheet,
    PanResponder,
    NativeModules,
    findNodeHandle,
    Dimensions,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import Animation from './Animation';

//add by liqiang 2018-2-11  for  loading
import LoadingForShow from "./LoadingForShow";


const winWidth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;
const winRatio = winWidth / winHeight;

const RCTUIManager = NativeModules.UIManager;


class ZoomImage extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        startCapture: PropTypes.bool,
        moveCapture: PropTypes.bool,
        responderNegotiate: PropTypes.func,
        easingFunc: PropTypes.func,
        rebounceDuration: PropTypes.number,
        closeDuration: PropTypes.number,
        showDuration: PropTypes.number,
        enableScaling: PropTypes.bool
    }
    static defaultProps = {
        disabled: false,
        startCapture: false,
        moveCapture: false,
        rebounceDuration: 800,
        closeDuration: 140,
        showDuration: 100,
        easingFunc: Easing.ease,
        enableScaling: false
    }

    constructor(props) {
        super(props);
        this.state = {
            maxSize: {
                width: 0,
                height: 0
            },
            isModalVisible: false,
            loading:false,

        };
        this.enableModal = false;
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.modalRefBind = this.modalRefBind.bind(this);
        this.getMaxSizeByRatio = this.getMaxSizeByRatio.bind(this);
        this.deletePhoto = this.deletePhoto.bind(this);
    }

    getMaxSizeByRatio(ratio) {
        return {
            /**
             *  图片按比例在屏幕上显示
             */

           width: ratio >= winRatio ? winWidth : winWidth / ratio,
            height: ratio >= winRatio ? winWidth / ratio : winHeight

            /**
             * change by liqiang
             *下面这个让图片的充满整个屏幕
             */
/*
             width: winWidth ,
             height:  winHeight*/
        };
    }

    componentDidMount() {
        if (this.props.source.uri) {
            Image.getSize(this.props.source.uri, (w, h) => {
                this.setState((state) => {
                    state.maxSize = this.getMaxSizeByRatio(w / h);
                    this.enableModal = true;
                });
            });
        } else {
            this.setState((state) => {
                state.maxSize = this.getMaxSizeByRatio(this.props.imgStyle.width / this.props.imgStyle.height);
                this.enableModal = true;
            });
        }
    }

    openModal() {
        if (!this.refs.view || !this.enableModal || this.props.disabled) return;
        RCTUIManager.measure(findNodeHandle(this.refs.view), (x, y, w, h, px, py) => {
            this.originPosition = {x, y, w, h, px, py};
        });
        this.setState({
            isModalVisible: true
        });
    }

    closeModal() {
        if (this.props.disabled) return;
        this.setState({
            isModalVisible: false
        });
    }

    deletePhoto() {
        if(this.props.photoUri !== undefined)  this.props.deletePhoto(this.props.photoUri);
    }

    modalRefBind(modal) {
        this._modal = modal;
    }

    render() {
        return (
            <TouchableWithoutFeedback style={this.props.imgStyle}
                                      onPress={this.openModal}
                                      onLongPress={this.deletePhoto}
                                      delayLongPress={2000}
                                      ref="view">
                <View style={this.props.style}>
                    <Image
                        source={{uri:this.props.source+'?size=100'}}
                        resizeMode={this.props.resizeMode}
                        style={this.props.imgStyle}/>
                    <ImageModal
                        ref={this.modalRefBind}
                        disabled={this.props.disabled}
                        visible={this.state.isModalVisible}
                        onClose={this.closeModal}
                        originPosition={this.originPosition}
                        size={this.state.maxSize}
                        minAlpha={this.props.minAlpha}
                        source={{uri:this.props.source}}
                        rebounceDuration={this.props.rebounceDuration}
                        closeDuration={this.props.closeDuration}
                        showDuration={this.props.showDuration}
                        easingFunc={this.props.easingFunc}
                        enableScaling={this.props.enableScaling}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

class ImageModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            source:require('./image/photo.png'),
            // source:require('./image/posun.png'),
            havePicture:false,
            isOpen:true,
        };
        this._initModalStyle = {
            style: {
                backgroundColor: 'rgba(0, 0, 0, 1)'
            }
        };
        this._modalStyle = JSON.parse(JSON.stringify(this._initModalStyle));
        this._initContentStyle = {
            style: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        };
        this._contentStyle = JSON.parse(JSON.stringify(this._initContentStyle));
        this._initImgSize = {
            style: this.props.size
        };
        this._imgSize = JSON.parse(JSON.stringify(this._initImgSize));
        this._inAnimation = false;
        this._setNativeProps = this._setNativeProps.bind(this);
        this._closeModalByTap = this._closeModalByTap.bind(this);
        this._closeModal = this._closeModal.bind(this);
        this._rebounce = this._rebounce.bind(this);
        this._touchPositionCheck = this._touchPositionCheck.bind(this);
        this._updateNativeStyles = this._updateNativeStyles.bind(this);
        this._pan = PanResponder.create({
            onStartShouldSetPanResponder: this._onStartShouldSetPanResponder.bind(this),
            onStartShouldSetPanResponderCapture: (evt, gestureState) => this.props.startCapture,
            onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder.bind(this),
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.props.moveCapture,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderGrant: this._handlePanResponderGrant.bind(this),
            onPanResponderMove: this._handlePanResponderMove.bind(this),
            onPanResponderRelease: this._handlePanResponderEnd.bind(this),
            onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
            onShouldBlockNativeResponder: (evt, gestureState) => true
        });
    }

    _onStartShouldSetPanResponder(evt, gestureState) {
        // set responder for tapping when the drawer is open
        // TODO: tap close
        if (this._inAnimation || this.props.disabled) return;
        return false;
    }

    _onMoveShouldSetPanResponder(evt, gestureState) {
        // custom pan responder condition function
        if (this._inAnimation || this.props.disabled) return;
        if (this.props.responderNegotiate && this.props.responderNegotiate(evt, gestureState) === false) return false;
        if (this._touchPositionCheck(gestureState)) {
            return true;
        }
        return false;
    }

    _handlePanResponderGrant(evt, gestureState) {
    }

    _handlePanResponderMove(evt, gestureState) {
        const {dy} = gestureState;
        this._updateNativeStyles(dy);
    }

    _handlePanResponderEnd(evt, gestureState) {
        const {dy} = gestureState;
        if (dy > 0.4 * winHeight) {
            this._closeModal(true);
        } else if (-dy > 0.4 * winHeight) {
            this._closeModal(false);
        } else {
            this._rebounce();
        }
    }

    _touchPositionCheck(gestureState) {
        const {dx, dy} = gestureState;
        if (Math.abs(dy) <= Math.abs(dx)) {
            return false;
        }
        return true;
    }

    _closeModal(isDown) {
        const {easingFunc, onClose, closeDuration} = this.props;
        let current = this._contentStyle.style.top;
        this._inAnimation = true;
        new Animation({
            start: current,
            end: isDown ? winHeight : -winHeight,
            duration: closeDuration,
            easingFunc,
            onAnimationFrame: (val) => {
                this._updateNativeStyles(val);
            },
            onAnimationEnd: () => {
                this._inAnimation = false;
                onClose();
                this._setNativeProps(true);
            }
        }).start();
    }

    _closeModalByTap() {
        this.state.loading===true?null:
        this.setState({
            loading:true,
            isOpen:false,
        });
        if (this._inAnimation) {
            return false;
        }
        this._closeModal(true);
    }

    _rebounce(isDown) {
        const {rebounceDuration, easingFunc} = this.props;
        let current = this._contentStyle.style.top;
        this._inAnimation = true;
        new Animation({
            start: current,
            end: 0,
            duration: Math.abs(current / winHeight) * rebounceDuration,
            easingFunc,
            onAnimationFrame: (val) => {
                this._updateNativeStyles(val);
            },
            onAnimationEnd: () => {
                this._inAnimation = false;
            }
        }).start();
    }

    _updateNativeStyles(dy) {
        const {
            width,
            height
        } = this.props.size;
        // this._contentStyle.style.left = dx;
        // this._contentStyle.style.right = -dx;
        this._contentStyle.style.top = dy;
        this._contentStyle.style.bottom = -dy;
        this._modalStyle.style.backgroundColor = `rgba(0, 0, 0, ${1 - Math.abs(dy) / winHeight * 0.9})`;
        if (this.props.enableScaling) {
            this._imgSize.style.width = width * (1 - Math.abs(dy / winHeight) * 0.6);
            this._imgSize.style.height = height * (1 - Math.abs(dy / winHeight) * 0.6);
        } else {
            this._imgSize.style.width = width;
            this._imgSize.style.height = height;
        }
        this._setNativeProps();
    }

    _setNativeProps(isReset) {
        if (isReset) {
            this._contentStyle = JSON.parse(JSON.stringify(this._initContentStyle));
            this._modalStyle = JSON.parse(JSON.stringify(this._initModalStyle));
            this._imgSize = JSON.parse(JSON.stringify(this._initImgSize));
        }
        this.content && this.content.setNativeProps(this._contentStyle);
        this.mask && this.mask.setNativeProps(this._modalStyle);
        //this.img && this.img.setNativeProps(this._imgSize);
    }

    componentDidUpdate() {
        new Animation({
            start: 0,
            end: 1,
            duration: this.props.showDuration,
            easingFunc: Easing.ease,
            onAnimationFrame: (val) => {
                this.mask && this.mask.setNativeProps({
                    style: {
                        opacity: val
                    }
                });
            },
            onAnimationEnd: () => {
                this._inAnimation = false;
            }
        }).start();
    }



    render() {
        const {
            visible,
            onClose,
            source,
            size  // origin size of the image
        } = this.props;
        if (visible) {
            this._inAnimation = true;
        }
        this._initImgSize.style = size;
        return (
        <View style={{backgroundColor:'rgba(0, 0, 0, 1)'}}>
            {/*
            照片显示这一块，我用的是两个modal，一进来，第一个modal的visible为false，所以不会显示，而第二个modal为true，会显示，
            此时，会通过<CachedImageBackground>组件加载图片，开始加载时执行onLoadStart方法，在其中更改判断中需要用到的一些属性，在加载中<LoadingForShow>会显示“正在加载中”的图标
            如加载成功，会执行<CachedImageBackground>组件的onLoad方法
            最后不管加载图片结果是否成功，都会执行onLoadEnd方法

            在第二个modal图片加载完后，第一个modal显示已经加载好的图片.<CachedImageBackground>这个组件会将图片缓存在应用中，此时不需要网络加载，直接显示

            */}
            <Modal
                visible={visible&&!this.state.loading}
                transparent={true}
                onRequestClose={onClose}>
                <TouchableWithoutFeedback
                    ref={ref => {
                        this.imgContainer = ref;
                    }}
                    onPress={
                        this._closeModalByTap
                    }>
                    <View style={styles.mask} ref={mask => {
                        this.mask = mask;
                    }} {...this._pan.panHandlers}>
                            <View
                                ref={ref => {
                                    this.content = ref;
                                }}
                                style={styles.content}
                            >
                                {console.log('loading 2',this.state.loading)}
                               {this.state.loading === true ?//由于一进来的时候，havePicture为null，所以如果不加此判定，一进来 会闪出一个自定义的破损的图片，效果不好，所以加了此行判定
                                       null
                                        :
                                        this.state.havePicture === true ?
                                            <Image
                                                source={this.props.source}
                                                style={[size, styles.img,{width:winWidth,height:winHeight}]}
                                                resizeMode={'contain'}
                                            />
                                            :
                                            <Image
                                            source={this.state.source}
                                            style={[size, styles.img,]}
                                            resizeMode={'contain'}
                                            />
                                }
                            </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                visible={visible}
                transparent={true}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback
                    onPress={
                        this._closeModalByTap
                    }>
                    <View  style={styles.mask}>

                        {this.state.isOpen===true?<LoadingForShow/>:null}
                        {console.log('loading 1',this.state.loading)}
                        <Image
                            ref={img => {
                                this.img = img;
                            }}
                            source={this.props.source}
                            style={[size, styles.img,]}
                            resizeMode={'contain'}
                            onLoad={() => this.setState({havePicture: true, loading: false,})}
                        />

                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
        );
    }
}

const styles = StyleSheet.create({
    mask: {
        position: 'absolute',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        opacity: 0
    },
    content: {
        position: 'absolute',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    toucharea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    modalText: {
        color: '#fff'
    }
});

ZoomImage.ImageModal = ImageModal;

export default ZoomImage;
