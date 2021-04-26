import React, {Component} from 'react';
import './Home.css';
import Header from '../../common/header/Header';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import {withStyles} from '@material-ui/core/styles';
import FavoriteIconBorder from '@material-ui/icons/FavoriteBorder';
import FavoriteIconFill from '@material-ui/icons/Favorite';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {constants} from '../../common/utils'

const styles =  theme => ({
  avatar: {
    margin: 10,
  },
  card: {
    maxWidth: 1100,
  },
  formControl: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'baseline',
  },
  media: {
    height:0,
    paddingTop: '56.25%', // 16:9
  },
  hr:{
    marginTop:'10px',
    borderTop:'2px solid #f2f2f2'
  },
  comment:{
    display:'flex',
    alignItems:'center'
  },
  grid:{
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    marginTop:90
  },
  gridList:{
    width: 1100,
    height: 'auto',
    overflowY: 'auto',
  }
});

class Home extends Component{

  constructor(props) {
    super(props);
    if (sessionStorage.getItem('access-token') == null) {
      props.history.replace('/');
    }
    this.state = {
      data: [],
      compData:[],
      likeCol:new Set(),
      comments:{},
      recentComment:"",
      userInfo:[],
      likes: 0,
      userData:[]
     
    }
  }

  componentDidMount(){
    this.getUserDetails();
  }

  render(){
    const{classes} = this.props;
    return(
      <div>
        <Header
          userProfileUrl="displaypic.png"
          screen={"Home"}
          handleLogout={this.logout}
          handleAccount={this.gotoAccountItem}
          searchHandler={this.searchItem}/>
        <div className={classes.grid}>
          <GridList className={classes.gridList} cellHeight={'auto'}>
            {this.state.compData.map((item, index) => (
              <GridListTile key={item.id}>
                <HomeItem
                  classes={classes}
                  item={item}
                  onLikedClicked={this.likeClickHandler}
                  onAddCommentClicked={this.commentAddEventHandler}
                  commentChangeEventHandler={this.commentChangeEventHandler}
                  userInfo={this.state.userInfo}
                  comments={this.state.comments}/>
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }

  searchItem = (value) =>{
    console.log('search value', value);
    let compData = this.state.userInfo;
    compData = compData.filter((data) =>{
      let subString = value.toLowerCase();
      let string = data.caption.toLowerCase();
      return string.includes(subString);
    })
    this.setState({
      userInfo: compData
    })
  }

  commentAddEventHandler = (id)=>{
    if (this.state.recentComment === "" || typeof this.state.recentComment === undefined) {
      return;
    }

    let commentList = this.state.comments.hasOwnProperty(id)?
      this.state.comments[id].concat(this.state.recentComment): [].concat(this.state.recentComment);

    this.setState({
      comments:{
        ...this.state.comments,
        [id]:commentList
      },
      recentComment:''
    })
  }


  commentChangeEventHandler = (e) => {
    this.setState({
      recentComment:e.target.value
    });
  }

  getUserDetails = () => {
    let that = this;
    let url = `${constants.userInfoUrl}=${sessionStorage.getItem('access-token')}`;
    return fetch(url,{
      method:'GET',
    }).then((response) =>{
        return response.json();
    }).then((jsonResponse) =>{
      that.setState({
        userInfo:jsonResponse.data
      });
      this.state.userInfo.map((data, index) => (
          this.fetchMedia(data.id)
      ));
    }).catch((error) => {
      console.log('error user data',error);
    });
  }

  fetchMedia = (id) => {
    let that = this;
    let url = `${constants.userMediaUrl}/${id}?fields=id,media_type,media_url,username,timestamp&access_token=&access_token=${sessionStorage.getItem('access-token')}`;
    return fetch(url,{
      method:'GET',
    }).then((response) =>{
        return response.json();
    }).then((jsonResponse) =>{
      that.setState({
        compData: this.state.compData.concat(jsonResponse)
      })
    }).catch((error) => {
      console.log('error user data',error);
    });
  }

  logout = () => {
    sessionStorage.clear();
    this.props.history.replace('/');
  }

  gotoAccountItem = () =>{
    this.props.history.push('/profile');
  }
}

class HomeItem extends Component{
  constructor(){
    super();
    this.state = {
      isLiked : false,
      comment:'',
      likes: 4
    }
  }

  render(){
    const {classes, item, userInfo, comments} = this.props;

    // Logic to calculate the time of instagram post and display time format of the posted image

    let createdTime = new Date(item.timestamp);
 
    let dd = createdTime.getDate();
    let mm = createdTime.getMonth() + 1;
    let yyyy = createdTime.getFullYear();

    
    let ss = createdTime.getSeconds();
    let MM = createdTime.getMinutes();
    let HH = createdTime.getHours();

    let time = dd+"/"+mm+"/"+yyyy+" "+HH+":"+MM+":"+ss;

    // API operation to fetch image caption
    let captionContent = '';
    let likeCount = this.state.likes;
    userInfo.forEach(data => {
      if (data.id === item.id) {
        captionContent = data.caption;
      }
    });

    if(captionContent === '') {
      return(<div className="home-container-main"></div>);
    } else {
      return(
          <div className="home-container-main">
            <Card className={classes.card}>
              <CardHeader
                  avatar={
                    <Avatar alt="User Profile Pic" src="displaypic.png" className={classes.avatar}/>
                  }
                  title={item.username}
                  subheader={time}
              />

              { /* item.media_url query to fetch Media API URL */ }
              <CardContent>
                <CardMedia
                    className={classes.media}
                    image={item.media_url}
                    title=""
                />
                <div className={classes.hr}>
                  <Typography component="p">

                    { /*  API Endpoint Fetch Caption */ }
                    {captionContent}
                  </Typography>
                  <Typography style={{color:'#4dabf5'}} component="p" >
                    { /*  Hard coding of the hashtags */ }
                    #Water #Rain #Sand
                  </Typography>
                </div>
              </CardContent>
              <CardActions>
                <IconButton aria-label="Add to favorites" onClick={this.onLikeClicked.bind(this,item.id)}>
                  {this.state.isLiked && <FavoriteIconFill style={{color:'#F44336'}}/>}
                  {!this.state.isLiked && <FavoriteIconBorder/>}
                </IconButton>
                <Typography component="p">

                  {  }
                  {likeCount} likes
                </Typography>
              </CardActions>

              <CardContent>
                {comments.hasOwnProperty(item.id) && comments[item.id].map((comment, index)=>{
                  return(
                      <div key={index} className="row">
                        <Typography component="p" style={{fontWeight:'bold'}}>
                          {sessionStorage.getItem('username')}:
                        </Typography>
                        <Typography component="p" >
                          {comment}
                        </Typography>
                      </div>
                  )
                })}
                <div className={classes.formControl}>
                  <FormControl style={{flexGrow:1}}>
                    <InputLabel htmlFor="comment">Add a comment</InputLabel>
                    <Input id="comment" value={this.state.comment} onChange={this.commentChangeEventHandler}/>
                  </FormControl>
                  <FormControl class="Addcomments">
                    <Button onClick={this.onAddCommentClicked.bind(this,item.id)}
                            variant="contained" color="primary">
                      ADD
                    </Button>
                  </FormControl>
                </div>
              </CardContent>
            </Card>
          </div>
      )
    }
  }

  onLikeClicked = (id) => {
    // 

    if (!this.state.isLiked) {
      this.setState({
        likes: this.state.likes + 1
      })
    } else {
      this.setState({
        likes: this.state.likes - 1
      })
    }
    if (this.state.isLiked) {
      this.setState({
        isLiked:false
      });
    }else {
      this.setState({
        isLiked:true
      });
    }
  }

  commentChangeEventHandler = (e) => {
    this.setState({
      comment:e.target.value,
    });
    this.props.commentChangeEventHandler(e);
  }

  onAddCommentClicked = (id) => {
    // Here, we are adding comments into the comment section

    if (this.state.comment === "" || typeof this.state.comment === undefined) {
      return;
    }
    this.setState({
      comment:""
    });
    this.props.onAddCommentClicked(id);
  }
}

export default withStyles(styles)(Home);
