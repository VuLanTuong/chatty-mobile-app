import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Image, TextInput } from 'react-native';
import { Divider } from 'react-native-paper';
import { ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAccessToken } from '../user-profile/getAccessToken';
import { findFriendById } from '../../service/friend.util';
import { useSelector } from 'react-redux';
import { useSocket } from '../socket.io/socket-context';
import { useFocusEffect } from '@react-navigation/native';

export function FriendRequest({ navigation }) {
    const [requests, setRequests] = useState([]);
    const [isAcpRequest, setIsAcptrRequest] = useState(false);
    const BASE_URL = "http://ec2-13-212-80-57.ap-southeast-1.compute.amazonaws.com:8555/api/v1"
    const myInfor = useSelector(state => state.user)
    const { socket } = useSocket()


    // .then((response) => response.json())
    // .then((data) => {
    //     if (data.status === 'fail') {
    //         console.log("fail");
    //         return;
    //     }
    //     console.log('response', data);
    //     console.log(data.data);
    //     return Promise.resolve(data.data);
    // })
    // .catch((error) => {
    //     console.log('Error:', error);
    // });
    // };

    // const cancelAddFriend = async () => {
    //     const accessToken = await getAccessToken();
    //     console.log(user._id);
    //     fetch(`http://ec2-52-221-252-41.ap-southeast-1.compute.amazonaws.com:8555/api/v1/friends/cancel/${user._id}`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: "Bearer " + accessToken
    //         }


    //     })
    //         .then(response => {
    //             console.log(response.status);
    //             if (!response.ok) {
    //                 console.log('error');
    //                 setIsSendRequest(true)
    //                 return;
    //             }
    //             console.log('success');
    //             setIsSendRequest(false);


    //         }
    //         )

    // }


    useEffect(() => {
        socket.on('friend:request', async (data) => {
            console.log(data);
            fetchFriendRequest().then(() => console.log('fetchFriendRequest'))
            if (data.friendRequest.recipient === myInfor.user._id && data.friendRequest.status != "accecpt") {
                setRequests([...requests, data.friendRequest]);

            }
            return;
        })

        socket.on('friend:accept', (data) => {
            console.log(data);
            if (data.friendRequest.recipient === myInfor.user._id && data.friendRequest.status === "accepted") {
                setRequests(requests.filter(request => request._id !== data.friendRequest._id));
            }
            return;
        })
        // socket.on('friend:reject', (data) => {
        //     console.log(data);
        //     if (myInfor.user._id === data.friendRequest.recipient) {
        //         console.log(requests);
        //         const newRequests = requests.filter(request => request.friend._id === data.friendRequest._id);
        //         console.log(newRequests);
        //         setRequests(newRequests);
        //     }
        //     return;
        // });


        socket.on('friend:cancel', (data) => {
            console.log(data);
            if (myInfor.user._id === data.userId) {

                setRequests(requests.filter(request => request.friend._id === data.friendRequest._id));

            }

            return;
        })
    }, [])
    console.log(requests);

    async function fetchFriendRequest() {
        console.log('fetchFriendRequest');
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${BASE_URL}/friends/requests`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken
                }
            });

            const data = await response.json();
            console.log(data);
            // const findFriendPromises = data.data.map(async (request) => {
            //     console.log(request);
            //     const friend = await findFriendById(request.userId);
            //     console.log(friend);
            //     return friend;
            // })

            // const friends = await Promise.all(findFriendPromises);
            // console.log(friends);
            setRequests(data.data);
            console.log("fetchFriendRequest success");
        } catch (error) {
            console.log('Error fetch all request:', error);

        }
    }


    // useEffect(() => {
    //     fetchFriendRequest();
    // }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchFriendRequest().then(() => console.log('fetchFriendRequest'));
            console.log('fetchFriendRequest effect');

        }, [])
    );

    const friends = useSelector(state => state.friends)


    const addFriend = async (id) => {
        const accessToken = await getAccessToken();

        fetch(`${BASE_URL}/friends/accept/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken
            }
        }
        ).then(response => {
            console.log(response.status);
            if (!response.ok) {
                console.log('error');
                setIsAcptrRequest(false);
                return;
            }
            console.log('success');
            setIsAcptrRequest(true);
            fetchFriendRequest().then(() => console.log('fetchFriendRequest'));



        }


        )

    }



    const handleAddFriend = async (id) => {
        try {
            console.log(id);
            await addFriend(id);
            fetchFriendRequest().then(() => console.log('fetchFriendRequest'));
            // const newRequests = requests.filter(request => request._id !== id);
            // setRequests(newRequests);
            // setRequests(requests.filter(request => request._id !== id));
            // fetchFriendRequest();
            // console.log("running");
        } catch (error) {
            console.log('Error:', error);
        }
    }



    const cancelAddFriend = async (request) => {

        let id;

        if (request.friend) {
            id = request.friend._id;
        } else {
            id = request.friendRequest._id;
        }

        console.log(id);
        const accessToken = await getAccessToken();
        fetch(`${BASE_URL}/friends/reject/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken
            }
        })
            .then(response => {
                console.log(response.status);
                if (!response.ok) {
                    console.log('error');
                    // setIsAcptrRequest(false)
                    return;
                }
                // setRequests(requests.filter(request => request._id !== id));
                // setIsAcptrRequest(true);



            }
            )

    }

    const viewProfileOfUser = async (id) => {
        const friend = await findFriendById(id);
        console.log(friend);
        if (friend) {
            navigation.navigate('FriendProfile', { friend: friend });
        }

    }

    return (
        // <View>
        //     <View style={{ flexDirection: 'row', width: '100%', marginLeft: 10 }}>
        //         <View style={{
        //             // flexDirection: 'row',
        //             // gap: 5,
        //             // backgroundColor: '#f558a4'
        //         }}>
        //             {/* <MaterialCommunityIcons name="back" color="white" size={20} />
        //             <TextInput
        //                 placeholder="Friend Request"
        //                 placeholderTextColor="white"
        //                 // value={searchKeyword}
        //                 // onSubmitEditing={() => navigation.navigate('SearchEngine', { keyword: searchKeyword })}
        //                 // onChangeText={text => setSearchKeyword(text)}
        //                 style={{ height: 20, fontSize: 17, color: 'white' }}
        //             /> */}

        //         </View>
        //     </View>
        // </View>

        <View style={{
            marginTop: 20,
        }}>
            {/* <View style={{
                flexDirection: 'row',
                width: '100%',
                marginLeft: 10,
                height: 40,
                marginTop: 10,
                gap: 10
            }}>
                <Pressable style={{
                    flexDirection: 'row'
                }} onPress={() => {
                    navigation.navigate('contact')
                }}>
                    <MaterialCommunityIcons name="arrow-left-bold" color="black" size={20} />
                    <Text

                        // value={searchKeyword}
                        // onSubmitEditing={() => navigation.navigate('SearchEngine', { keyword: searchKeyword })}
                        // onChangeText={text => setSearchKeyword(text)}
                        style={{ height: 20, fontSize: 15, color: 'black', fontWeight: 700 }}
                    >Friend Request</Text>

                </Pressable>

            </View> */}

            {requests.map((request) => (
                // request = findFriendById(request._id)

                <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{
                    height: '100%'

                }}> <View key={request._id}
                    style={{
                        flexDirection: 'column',
                        gap: 15,
                        marginLeft: 10

                    }}>

                        <View style={{
                            flexDirection: 'row',
                            gap: 20,
                            marginTop: 10
                        }}>
                            {/* onPress to go to profile of user */}
                            <Pressable style={{
                                flexDirection: 'row',
                                gap: 20
                            }} onPress={() => viewProfileOfUser(request._id)}>
                                {/* // api to get avatar */}
                                <Image source={{ uri: request.avatar }} style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50

                                }} />
                                <View style={{
                                    marginTop: -10,
                                    flexDirection: 'column',
                                    gap: 5
                                }}>
                                    <Text style={{
                                        marginTop: 10,

                                        fontSize: 15
                                    }}>{request.name}</Text>
                                </View>


                            </Pressable>


                        </View>
                        <View style={{
                            marginLeft: 10,
                            flexDirection: 'row',
                            gap: 10
                        }}>
                            <Pressable style={{
                                height: 30,
                                width: 120,
                                borderRadius: 5,
                                backgroundColor: '#f558a4',
                                marginLeft: 60,

                            }} onPress={() => handleAddFriend(request.friend._id)}>
                                <Text style={{
                                    color: 'white',
                                    marginLeft: 40,
                                    marginTop: 5
                                }}>Accept</Text>
                            </Pressable>
                            <Pressable style={{
                                height: 30,
                                width: 120,
                                borderRadius: 5,
                                backgroundColor: '#969190',


                            }} onPress={() => cancelAddFriend(request).then(() =>
                                fetchFriendRequest())}>
                                <Text style={{
                                    color: 'white',
                                    marginLeft: 40,
                                    marginTop: 5
                                }}>Reject</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            ))}

        </View>
    )

}

export default FriendRequest;