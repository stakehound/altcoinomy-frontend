import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Spinner, CardGroup, Card, CardHeader, ListGroup, ListGroupItem } from 'reactstrap';
import moment from 'moment';

function VideoConferenceForm(props) {
  const { VideoConferenceStore, SubscriptionStore, subscriptionId } = props;
  const { loading, slots } = VideoConferenceStore;
  const { fillStatus } = SubscriptionStore;

  useEffect(() => {
    VideoConferenceStore.loadSlots();
  }, [VideoConferenceStore]);

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  console.log("FILL STATUS");

  return (
    <CardGroup>
      {
        Object.keys(slots).map(date =>
          <Card key={date}>
            <CardHeader>
              {moment(date).format('DD/MM/YYYY')}
            </CardHeader>
            <ListGroup flush>
              {
                slots[date].map(slot =>
                  <ListGroupItem
                    key={slot.id} tag="button" action
                    className={`${slot.status === 'BOOKED' ? 'is-not-active' : ''} ${fillStatus.video_conference_slot_id === slot.id ? 'current' : ''}`}
                    onClick={() => {
                      VideoConferenceStore.bookSlot(slot.id, subscriptionId)
                        .then(res => {
                          SubscriptionStore.loadFillStatus(subscriptionId);
                        });
                    }}
                  >
                    {moment(slot.date).format('HH:mm')}
                  </ListGroupItem>
                )
              }
            </ListGroup>
          </Card>
        )
      }
    </CardGroup>
  );
}

export default inject('VideoConferenceStore', 'SubscriptionStore')(observer(VideoConferenceForm));
