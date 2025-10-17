import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';

const boatImg = require('@/assets/images/motorboat.png');
const logo = require('@/assets/images/logo.png');
const icon = require('@/assets/images/logo_icon.png');

const { width, height } = Dimensions.get('screen');
const tripType = ['One Way', 'Round Trip'];
const type = ['Passenger', 'Rolling Cargo', 'Manage Booking']

export default function Index() {
  const data = [
    { label: 'Hilongos', value: 'Hilongos' },
    { label: 'Ubay, Bohol', value: 'Ubay' }
  ]

  const [activeTab, setActiveTab] = useState('One Way');
  const [activeType, setActiveType] = useState('Passenger');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedate] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [retunCalendar, setReturnCalendar] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [calendar, setCalendar] = useState(false);
  const [from, setFrom] = useState(data[0].value);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const date = selectedDate ? new Date(selectedDate) : null;
  const formattedDate = date
    ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const departDateObj = departDate ? new Date(departDate) : null;
  const returnDateObj = returnDate ? new Date(returnDate) : null;
  const formattedDepartDate = departDateObj
    ? departDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const formattedReturnDate = returnDateObj
    ? returnDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';


  useEffect(() => {
    setLoading(true);
    setSelectedate('');
    setDepartDate('');
    setReturnDate('');
    fadeAnim.setValue(0);
    
    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }).start();
    }, 500);
  }, [activeTab]);

  return (
    <View style={{height: height, width: '100%', alignItems: 'center', backgroundColor: '#f1f1f1', }}>

      <View style={{ width: width, height: '32%', position: 'relative', }}>
        <View style={{ position: 'absolute', top: 40, zIndex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Image source={icon} style={{ height: 40, width: 40 }} />
            <Image source={logo} style={{ height: 25, width: 100 }} />
          </View>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#FFC107', alignItems: 'center', borderRadius: 30, justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
        </View>

        <Image source={boatImg} contentFit="cover" style={{ width: '100%', height: '100%', borderBottomRightRadius: 30, borderBottomLeftRadius: 30}} />
        <LinearGradient
            colors={[
              'rgba(253, 0, 0, 0.08)',     // Fully transparent red
              'rgba(228, 80, 80, 0.15)',// Very light red
              'rgba(228, 80, 80, 0.4)', // Medium soft red
              'rgba(214, 48, 65, 0.8)'  // Rich red
            ]}
            style={{ flex: 1, height: '110%', position: 'absolute', width: '100%', bottom: 0, borderBottomRightRadius: 30, borderBottomLeftRadius: 30 }}
        />
        <View style={{ flexDirection: 'column', position: 'absolute', zIndex: 2, bottom: 30, left: 20, width: '70%', gap: 10 }}>
          <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', textShadowColor: '#696969', textShadowRadius: 2 }}>Gateway Leyte-Bohol Travel</Text>
          <Text style={{ fontSize: 12, color: '#fff' }}>
            Sail in comfort between Hilongos and Ubay!
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, width: '100%', alignItems: 'center', marginTop: 15 }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4b6bc4d', borderRadius: 30, width: '55%'}}>
            {tripType.map((type) => (
              <TouchableOpacity key={type} onPress={() => setActiveTab(type)} style={{ width: '50%' }}>
                <Text style={[{ color: '#000', paddingHorizontal: 15, paddingVertical: 11, textAlign: 'center', fontWeight: 'bold', fontSize: 11 }, activeTab === type && { backgroundColor: '#cf2a3a', borderRadius: 30, color: '#fff'}]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ padding: 15, flex: 1, position: 'relative'}}>
          <View style={{ flexDirection: 'row' }}>
            {type.map((type) => (
              <TouchableOpacity key={type} onPress={() => setActiveType(type)} style={[{ backgroundColor: 'transparent', padding: 10 }, activeType == type && { backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                <Text style={[{ fontWeight: 'bold', color: '#848484ff' }, activeType == type && {color: '#cf2a3a'}]} >
                  {type}
                </Text>
              </TouchableOpacity>
              ))}
          </View>
          <ScrollView contentContainerStyle={{ width: '100%', padding: 10, backgroundColor: '#fff', borderTopRightRadius: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
            <View style={{ width: '100%', marginTop: 10, flexDirection: 'row', borderRadius: 10, backgroundColor: '#f4b6bc4d', }}>
              <View style={{ backgroundColor: '#cf2a3a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 15,  width: '25%', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>
                <Ionicons name="boat" size={20} color={'#fff'} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>From</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Dropdown
                  data={data}
                  labelField="label"
                  valueField="value"
                  value={from}
                  placeholder=""
                  style={{
                    height: 40,
                    width: '85%',
                    paddingHorizontal: 10,
                  }}
                  containerStyle={{
                    alignSelf: 'flex-start',
                    width: '67%'
                  }}
                  onChange={item => {
                    setFrom(item.value);
                  }}
                  selectedTextStyle={{ fontWeight: 'bold', fontSize: 14 }}
                  renderRightIcon={() => (
                    <Ionicons name="chevron-down" size={22} />
                  )}
                  dropdownPosition="bottom"
                />
              </View>
            </View>

            <View style={{ width: '100%', marginTop: 10, flexDirection: 'row', borderRadius: 10, backgroundColor: '#f4b6bc4d', }}>
              <View style={{ backgroundColor: '#cf2a3a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 15,  width: '25%', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>
                <Ionicons name="location" size={20} color={'#fff'} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>To</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold',paddingHorizontal: 10, paddingVertical: 15, width: '65%' }}>
                  {from == 'Hilongos' ? 'Ubay, Bohol' : 'Hilongos'}
                </Text>
              </View>
            </View>

            {calendar && (
              <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                  <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                    <Calendar
                      minDate={new Date().toISOString().split('T')[0]}
                      onDayPress={(day) => {
                          if(activeTab == 'One Way') {
                            setSelectedate(day.dateString); setCalendar(false)
                          } else if (activeTab == 'Round Trip' && retunCalendar == false) {
                            setDepartDate(day.dateString); setCalendar(false)
                          } else if (activeTab == 'Round Trip' && retunCalendar == true) {
                            setReturnDate(day.dateString); setCalendar(false)
                          } else {
                            setReturnCalendar(false);
                            setCalendar(false);
                          }
                      }}
                    markedDates={{ [activeTab == 'One Way' && selectedDate ? selectedDate : retunCalendar == false ? departDate : returnDate  ]: {selected: true, selectedColor: '#CF2A3A'} }} 
                    />
                    <TouchableOpacity onPress={() => [setCalendar(false), setReturnCalendar(false)]} style={{ marginTop: 20, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                      <Text style={{ color: '#fff', textAlign: 'center' }}>Close Calendar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
            
            {loading ? (
              <View/>
            ) : !loading && activeTab == 'One Way' ? (
              <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
                  <View style={{ marginTop: 8, flexDirection: 'column', gap: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Departure</Text>
                    <TouchableOpacity onPress={() => setCalendar(true)} style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4b6bc4d', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 15 }}>
                      <Text>{formattedDate ? formattedDate : 'Select Date'}</Text>
                      <Ionicons name="calendar" size={22} />
                    </TouchableOpacity>
                  </View>
              </Animated.View>
            ) : (
              <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ flexDirection: 'column', gap: 5, width: '48%', }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Departure</Text>
                    <TouchableOpacity onPress={() => [setCalendar(true), setReturnCalendar(false)]} style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4b6bc4d', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 15 }}>
                      <Text style={{ fontSize: 13 }}>{formattedDepartDate ? formattedDepartDate : 'Select Date'}</Text>
                      <Ionicons name="calendar" size={22} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'column', gap: 5, width: '48%', }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Return</Text>
                    <TouchableOpacity onPress={() => [setCalendar(true), setReturnCalendar(true)]} style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4b6bc4d', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 15 }}>
                      <Text style={{ fontSize: 13 }}>{formattedReturnDate ? formattedReturnDate : 'Select Date'}</Text>
                      <Ionicons name="calendar" size={22} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            <View style={{ marginTop: 8, flexDirection: 'column', gap: 5 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Passengers</Text>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4b6bc4d', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 15 }}>
                <Text>1 Adult</Text>
                <Ionicons name="person-add" size={22} />
              </View>
            </View>

            <TouchableOpacity style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#cf2a3a', borderRadius: 30, paddingVertical: 15, marginTop: 10 }}>
              <Ionicons name="search" size={22} color={'#fff'} />
              <Text style={{ fontWeight: 'bold', color: '#fff'}}>Search</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

      </View>
      
    </View>
  );
}