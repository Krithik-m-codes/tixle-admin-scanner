import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Event } from '../types/database';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  isBooked?: boolean;
  showBookingStatus?: boolean;
}

export function EventCard({
  event,
  onPress,
  isBooked = false,
  showBookingStatus = true,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      music: 'musical-notes',
      sports: 'football',
      technology: 'laptop',
      food: 'restaurant',
      art: 'brush',
      business: 'briefcase',
      education: 'school',
      entertainment: 'film',
    };
    return icons[category] || 'calendar';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      music: '#8B5CF6',
      sports: '#10B981',
      technology: '#3B82F6',
      food: '#F59E0B',
      art: '#EF4444',
      business: '#6366F1',
      education: '#14B8A6',
      entertainment: '#F97316',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <Card onPress={onPress} style={{ marginBottom: 16 }}>
      {/* Event Image */}
      {event.image_url && (
        <Image
          source={{ uri: event.image_url }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}

      {/* Header with category and live status */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getCategoryColor(event.category),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
          <Ionicons
            name={getCategoryIcon(event.category)}
            size={12}
            color="white"
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '500',
              textTransform: 'capitalize',
            }}>
            {event.category}
          </Text>
        </View>

        {event.is_live && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EF4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'white',
                marginRight: 4,
              }}
            />
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '500',
              }}>
              LIVE
            </Text>
          </View>
        )}
      </View>

      <CardHeader title={event.title} subtitle={event.location} />

      <CardContent>
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 12,
          }}
          numberOfLines={2}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>
              {formatDate(event.start_date)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>
              {event.current_attendees}/{event.max_attendees}
            </Text>
          </View>
        </View>

        {/* Price and Virtual indicator */}
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#111827',
            }}>
            {formatPrice(event.price)}
          </Text>

          {event.is_virtual && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
              <Ionicons name="videocam" size={14} color="#6B7280" />
              <Text
                style={{
                  fontSize: 12,
                  color: '#6B7280',
                  marginLeft: 4,
                  fontWeight: '500',
                }}>
                Virtual
              </Text>
            </View>
          )}
        </View>
      </CardContent>

      {/* Booking Status */}
      {showBookingStatus && (
        <CardFooter>
          {isBooked ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D1FAE5',
                paddingVertical: 8,
                borderRadius: 8,
              }}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text
                style={{
                  marginLeft: 6,
                  color: '#059669',
                  fontWeight: '600',
                }}>
                Booked
              </Text>
            </View>
          ) : (
            <Button
              title={event.is_live ? 'Join Live Event' : 'View Details'}
              variant="primary"
              size="sm"
              fullWidth
              icon={event.is_live ? 'play' : 'arrow-forward'}
              iconPosition="right"
            />
          )}
        </CardFooter>
      )}
    </Card>
  );
}
