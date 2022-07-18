from argparse import Namespace
from ast import Global
from flask_socketio import SocketIO, emit
from flask import Flask, render_template, url_for, copy_current_request_context
from random import random
from time import sleep
from threading import Thread, Event
# from pymavlink import mavutils
import sys
from queue import Queue

__author__ = 'slynn'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = False
app.config['USE_RELOADER']=False
app.config['HOST']='0.0.0.0'
app.config['PORT']='80'

#turn the flask app into a socketio app
socketio = SocketIO(app, async_mode=None, logger=True, engineio_logger=True)

#random number Generator Thread
thread1 = Thread()
thread2 = Thread()
thread_stop_event = Event()
#def receive_command():
#    while not thread_stop_event.isSet():
#        @socketio.on('sendcommand',namespace='/test')
#        def give_command(mode):
#            print("uploading mode: ")
#            print(mode)
#            mode_id = master.mode_mapping()[mode.message]
#            master.set_mode(mode_id) 
#            while True:
#        # Wait for ACK command
#    # Would be good to add mechanism to avoid endlessly blocking
#    # if the autopilot sends a NACK or never receives the message
#                ack_msg = master.recv_match(type='COMMAND_ACK', blocking=True)
#                ack_msg = ack_msg.to_dict()
#
#    # Continue waiting if the acknowledged command is not `set_mode`
#                if ack_msg['command'] != mavutil.mavlink.MAV_CMD_DO_SET_MODE:
#                    continue
#
#    # Print the ACK result !
#                print(mavutil.mavlink.enums['MAV_RESULT'][ack_msg['result']].description)
#                socketio.emit('success',{'message': str(mavutil.mavlink.enums['MAV_RESULT'][ack_msg['result']].description)},namespace='/test')
#                break
#        socketio.sleep(0)


def messageReceiver():
    """
    Generate a random number every 2 seconds and emit to a socketio instance (broadcast)
    Ideally to be run in a separate thread?
    """
    #infinite loop of magical random numbers
   # print("Making random numbers")
    global g
    g = Queue(0)
    while not thread_stop_event.isSet():
        msg = master.recv_match()
        #print(msg)
        #print(str(msg))
        if msg == None:
            continue
        else:
            g.put(msg)  
        socketio.sleep(0)

def sendMessage():
    print("send message")
    global g
    while not thread_stop_event.isSet():
        msg = g.get_nowait()
        #print("QUEUE SIZE")
        #print(g.qsize())
        if msg.get_type() == 'ATTITUDE':
               # print(msg.roll)
            socketio.emit('ar', {'message': str(msg.roll)}, namespace='/test')
            socketio.emit('ap', {'message': str(msg.pitch)}, namespace='/test')
            socketio.emit('ay', {'message': str(msg.yaw)}, namespace='/test')
            socketio.emit('ars', {'message': str(msg.rollspeed)}, namespace='/test')
            socketio.emit('aps', {'message': str(msg.pitchspeed)}, namespace='/test')
            socketio.emit('ays', {'message': str(msg.yawspeed)}, namespace='/test')

        elif msg.get_type()=='GLOBAL_POSITION_INT':
            socketio.emit('gpsi',{'message': str(msg)}, namespace='/test')
            socketio.emit('gpsitb',{'message':str(msg.time_boot_ms)},namespace='/test')
            socketio.emit('gpsilon',{'message':str(msg.lon)},namespace='/test')
            socketio.emit('gpsihdg',{'message':str(msg.hdg)},namespace='/test')
            socketio.emit('gpsivz',{'message':str(msg.vz)},namespace='/test')
            socketio.emit('gpsivy',{'message':str(msg.vy)},namespace='/test')
            socketio.emit('gpsivx',{'message':str(msg.vx)},namespace='/test')
            socketio.emit('gpsiralt',{'message':str(msg.relative_alt)},namespace='/test')
            socketio.emit('gpsialt',{'message':str(msg.alt)},namespace='/test')
            socketio.emit('gpsilat',{'message':str(msg.lat)},namespace='/test')
        elif msg.get_type()=='SYS_STATUS':
            socketio.emit('sys',{'message': str(msg)}, namespace='/test')
            socketio.emit('sysocse',{'message': str(msg.onboard_control_sensors_enabled)}, namespace='/test')
            socketio.emit('sysocsp',{'message': str(msg.onboard_control_sensors_present)}, namespace='/test')
            socketio.emit('sysocsh',{'message': str(msg.onboard_control_sensors_health)}, namespace='/test')
            socketio.emit('syscb',{'message': str(msg.current_battery)}, namespace='/test')
            socketio.emit('sysvb',{'message': str(msg.voltage_battery)}, namespace='/test')
            socketio.emit('sysbr',{'message': str(msg.battery_remaining)}, namespace='/test')
            socketio.emit('sysdrc',{'message': str(msg.drop_rate_comm)}, namespace='/test')
            socketio.emit('sysecomm',{'message': str(msg.errors_comm)}, namespace='/test')
            socketio.emit('sysecount',{'message': str(msg.errors_count1)}, namespace='/test')
            socketio.emit('sysecount',{'message': str(msg.errors_count2)}, namespace='/test')
            socketio.emit('sysecount',{'message': str(msg.errors_count3)}, namespace='/test')
            socketio.emit('sysecount',{'message': str(msg.errors_count4)}, namespace='/test')
            socketio.emit('sysload',{'message': str(msg.load)}, namespace='/test')
        elif msg.get_type()=='POWER_STATUS':
            socketio.emit('ps',{'message': str(msg)}, namespace='/test')
            socketio.emit('psvs',{'message': str(msg.Vservo)}, namespace='/test')
            socketio.emit('psflags',{'message': str(msg.flags)}, namespace='/test')
            socketio.emit('psvcc',{'message': str(msg.Vcc)}, namespace='/test')
        elif msg.get_type()=='MEMINFO':
            socketio.emit('mi',{'message': str(msg)}, namespace='/test')
            socketio.emit('mifm32',{'message': str(msg.freemem32)}, namespace='/test')
            socketio.emit('mifm',{'message': str(msg.freemem)}, namespace='/test')
            socketio.emit('mibv',{'message': str(msg.brkval)}, namespace='/test')
        elif msg.get_type()=='NAV_CONTROLLER_OUTPUT':
            socketio.emit('nco',{'message': str(msg)}, namespace='/test')
            socketio.emit('nconr',{'message': str(msg.nav_roll)}, namespace='/test')
            socketio.emit('mconb',{'message': str(msg.nav_bearing)}, namespace='/test')
            socketio.emit('mcotb',{'message': str(msg.target_bearing)}, namespace='/test')
            socketio.emit('mcowpd',{'message': str(msg.wp_dist)}, namespace='/test')
            socketio.emit('mcoalte',{'message': str(msg.alt_error)}, namespace='/test')
            socketio.emit('mcoaspde',{'message': str(msg.aspd_error)}, namespace='/test')
            socketio.emit('mcoxte',{'message': str(msg.xtrack_error)}, namespace='/test')
            socketio.emit('mconp',{'message': str(msg.nav_pitch)}, namespace='/test')
        elif msg.get_type()=='MISSION_CURRENT':
            socketio.emit('mcseq',{'message': str(msg.seq)}, namespace='/test')
        elif msg.get_type()=='TIMESYNC':
            socketio.emit('tstc1',{'message': str(msg.tc1)}, namespace='/test')
            socketio.emit('tsts1',{'message': str(msg.ts1)}, namespace='/test')
        elif msg.get_type()=='SERVO_OUTPUT_RAW':
            socketio.emit('sortu',{'message': str(msg.time_usec)}, namespace='/test')
            socketio.emit('sorport',{'message': str(msg.port)}, namespace='/test')
            socketio.emit('sors1r',{'message': str(msg.servo1_raw)}, namespace='/test')
            socketio.emit('sors2r',{'message': str(msg.servo2_raw)}, namespace='/test')
            socketio.emit('sors3r',{'message': str(msg.servo3_raw)}, namespace='/test') 
            socketio.emit('sors4r',{'message': str(msg.servo4_raw)}, namespace='/test') 
            socketio.emit('sors5r',{'message': str(msg.servo5_raw)}, namespace='/test') 
            socketio.emit('sors6r',{'message': str(msg.servo6_raw)}, namespace='/test') 
            socketio.emit('sors7r',{'message': str(msg.servo7_raw)}, namespace='/test') 
            socketio.emit('sors8r',{'message': str(msg.servo8_raw)}, namespace='/test') 
            socketio.emit('sors9r',{'message': str(msg.servo9_raw)}, namespace='/test') 
            socketio.emit('sors10r',{'message': str(msg.servo10_raw)}, namespace='/test') 
            socketio.emit('sors11r',{'message': str(msg.servo11_raw)}, namespace='/test') 
            socketio.emit('sors12r',{'message': str(msg.servo12_raw)}, namespace='/test') 
            socketio.emit('sors13r',{'message': str(msg.servo13_raw)}, namespace='/test') 
            socketio.emit('sors14r',{'message': str(msg.servo14_raw)}, namespace='/test')   
            socketio.emit('sors15r',{'message': str(msg.servo15_raw)}, namespace='/test') 
            socketio.emit('sors16r',{'message': str(msg.servo16_raw)}, namespace='/test') 
        elif msg.get_type()=='RC_CHANNELS':
            socketio.emit('rctbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('rccc',{'message': str(msg.chancount)}, namespace='/test')
            socketio.emit('rcc1r',{'message': str(msg.chan1_raw)}, namespace='/test')
            socketio.emit('rcc2r',{'message': str(msg.chan2_raw)}, namespace='/test')
            socketio.emit('rcc3r',{'message': str(msg.chan3_raw)}, namespace='/test')
            socketio.emit('rcc4r',{'message': str(msg.chan4_raw)}, namespace='/test')
            socketio.emit('rcc5r',{'message': str(msg.chan5_raw)}, namespace='/test')
            socketio.emit('rcc6r',{'message': str(msg.chan6_raw)}, namespace='/test')
            socketio.emit('rcc7r',{'message': str(msg.chan7_raw)}, namespace='/test')
            socketio.emit('rcc8r',{'message': str(msg.chan8_raw)}, namespace='/test')
            socketio.emit('rcc9r',{'message': str(msg.chan9_raw)}, namespace='/test')
            socketio.emit('rcc10r',{'message': str(msg.chan10_raw)}, namespace='/test')
            socketio.emit('rcc11r',{'message': str(msg.chan11_raw)}, namespace='/test')
            socketio.emit('rcc12r',{'message': str(msg.chan12_raw)}, namespace='/test')
            socketio.emit('rcc13r',{'message': str(msg.chan13_raw)}, namespace='/test')
            socketio.emit('rcc14r',{'message': str(msg.chan14_raw)}, namespace='/test')
            socketio.emit('rcc15r',{'message': str(msg.chan15_raw)}, namespace='/test')
            socketio.emit('rcc16r',{'message': str(msg.chan16_raw)}, namespace='/test')
            socketio.emit('rcc17r',{'message': str(msg.chan17_raw)}, namespace='/test')
            socketio.emit('rcc18r',{'message': str(msg.chan18_raw)}, namespace='/test')
            socketio.emit('rcrssi',{'message': str(msg.rssi)}, namespace='/test')
        elif msg.get_type()=='RAW_IMU':
            socketio.emit('ritu',{'message': str(msg.time_usec)}, namespace='/test')
            socketio.emit('rixacc',{'message': str(msg.xacc)}, namespace='/test')
            socketio.emit('riyacc',{'message': str(msg.yacc)}, namespace='/test')
            socketio.emit('rizacc',{'message': str(msg.zacc)}, namespace='/test')
            socketio.emit('rixgyro',{'message': str(msg.xgyro)}, namespace='/test')
            socketio.emit('riygyro',{'message': str(msg.ygyro)}, namespace='/test')
            socketio.emit('rizgyro',{'message': str(msg.zgyro)}, namespace='/test')
            socketio.emit('rixmag',{'message': str(msg.xmag)}, namespace='/test')
            socketio.emit('riymag',{'message': str(msg.ymag)}, namespace='/test')
            socketio.emit('rizmag',{'message': str(msg.zmag)}, namespace='/test')
            socketio.emit('riid',{'message': str(msg.id)}, namespace='/test')
            socketio.emit('ritemp',{'message': str(msg.temperature)}, namespace='/test')           
        elif msg.get_type()=='SCALED_IMU2':
            socketio.emit('si2xacc',{'message': str(msg.xacc)}, namespace='/test')
            socketio.emit('si2yacc',{'message': str(msg.yacc)}, namespace='/test')
            socketio.emit('si2zacc',{'message': str(msg.zacc)}, namespace='/test')
            socketio.emit('si2xgyro',{'message': str(msg.xgyro)}, namespace='/test')
            socketio.emit('si2ygyro',{'message': str(msg.ygyro)}, namespace='/test')
            socketio.emit('si2zgyro',{'message': str(msg.zgyro)}, namespace='/test')
            socketio.emit('si2xmag',{'message': str(msg.xmag)}, namespace='/test')
            socketio.emit('si2ymag',{'message': str(msg.ymag)}, namespace='/test')
            socketio.emit('si2zmag',{'message': str(msg.zmag)}, namespace='/test')
            socketio.emit('si2tbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('si2temp',{'message': str(msg.temperature)}, namespace='/test')
        elif msg.get_type()=='SCALED_IMU3':
            socketio.emit('si3xacc',{'message': str(msg.xacc)}, namespace='/test')
            socketio.emit('si3yacc',{'message': str(msg.yacc)}, namespace='/test')
            socketio.emit('si3zacc',{'message': str(msg.zacc)}, namespace='/test')
            socketio.emit('si3xgyro',{'message': str(msg.xgyro)}, namespace='/test')
            socketio.emit('si3ygyro',{'message': str(msg.ygyro)}, namespace='/test')
            socketio.emit('si3zgyro',{'message': str(msg.zgyro)}, namespace='/test')
            socketio.emit('si3xmag',{'message': str(msg.xmag)}, namespace='/test')
            socketio.emit('si3ymag',{'message': str(msg.ymag)}, namespace='/test')
            socketio.emit('si3zmag',{'message': str(msg.zmag)}, namespace='/test')
            socketio.emit('si3tbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('si3temp',{'message': str(msg.temperature)}, namespace='/test')
        elif msg.get_type()=='SCALED_PRESSURE':
            socketio.emit('sptbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('sppabs',{'message': str(msg.press_abs)}, namespace='/test')
            socketio.emit('sppdiff',{'message': str(msg.press_diff)}, namespace='/test')
            socketio.emit('sptemp',{'message': str(msg.temperature)}, namespace='/test')
            socketio.emit('sptpdiff',{'message': str(msg.temperature_press_diff)}, namespace='/test')
        elif msg.get_type()=='SCALED_PRESSURE2':
            socketio.emit('sp2tbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('sp2pabs',{'message': str(msg.press_abs)}, namespace='/test')
            socketio.emit('sp2pdiff',{'message': str(msg.press_diff)}, namespace='/test')
            socketio.emit('sp2temp',{'message': str(msg.temperature)}, namespace='/test')
            socketio.emit('sp2tpdiff',{'message': str(msg.temperature_press_diff)}, namespace='/test')
        elif msg.get_type()=='GPS_RAW_INT':
            socketio.emit('gritu',{'message': str(msg.time_usec)}, namespace='/test')
            socketio.emit('grift',{'message': str(msg.fix_type)}, namespace='/test')
            socketio.emit('grilat',{'message': str(msg.lat)}, namespace='/test')
            socketio.emit('grilon',{'message': str(msg.lon)}, namespace='/test')
            socketio.emit('grialt',{'message': str(msg.alt)}, namespace='/test')
            socketio.emit('grieph',{'message': str(msg.eph)}, namespace='/test')
            socketio.emit('griepv',{'message': str(msg.epv)}, namespace='/test')
            socketio.emit('grivel',{'message': str(msg.vel)}, namespace='/test')
            socketio.emit('gricog',{'message': str(msg.cog)}, namespace='/test')
            socketio.emit('grisatv',{'message': str(msg.satellites_visible)}, namespace='/test')
            socketio.emit('griae',{'message': str(msg.alt_ellipsoid)}, namespace='/test')
            socketio.emit('grihac',{'message': str(msg.h_acc)}, namespace='/test')
            socketio.emit('grivac',{'message': str(msg.v_acc)}, namespace='/test')
            socketio.emit('grivela',{'message': str(msg.vel_acc)}, namespace='/test')
            socketio.emit('grihdga',{'message': str(msg.hdg_acc)}, namespace='/test')
            socketio.emit('griyaw',{'message': str(msg.yaw)}, namespace='/test')
        elif msg.get_type()=='SYSTEM_TIME':
            socketio.emit('sttu',{'message': str(msg.time_unix_usec)}, namespace='/test')
            socketio.emit('sttbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
        elif msg.get_type()=='AHRS':
            socketio.emit('ahrsoix',{'message': str(msg.omegaIx)}, namespace='/test')
            socketio.emit('ahrsoiy',{'message': str(msg.omegaIy)}, namespace='/test')
            socketio.emit('ahrsoiz',{'message': str(msg.omegaIz)}, namespace='/test')
            socketio.emit('ahrsaw',{'message': str(msg.accel_weight)}, namespace='/test')
            socketio.emit('ahrsrv',{'message': str(msg.renorm_val)}, namespace='/test')
            socketio.emit('ahrser',{'message': str(msg.error_rp)}, namespace='/test')
            socketio.emit('ahrsey',{'message': str(msg.error_yaw)}, namespace='/test')
        elif msg.get_type()=='HWSTATUS':
            socketio.emit('hsvc',{'message': str(msg.Vcc)}, namespace='/test')
            socketio.emit('hsie',{'message': str(msg.I2Cerr)}, namespace='/test')
        elif msg.get_type()=='WIND':
            socketio.emit('windd',{'message': str(msg.direction)}, namespace='/test')
            socketio.emit('winds',{'message': str(msg.speed)}, namespace='/test')
            socketio.emit('windsz',{'message': str(msg.speed_z)}, namespace='/test')
        elif msg.get_type()=='TERRAIN_REPORT':
            socketio.emit('trlat',{'message': str(msg.lat)}, namespace='/test')
            socketio.emit('trlon',{'message': str(msg.lon)}, namespace='/test')
            socketio.emit('trs',{'message': str(msg.spacing)}, namespace='/test')
            socketio.emit('trth',{'message': str(msg.terrain_height)}, namespace='/test')
            socketio.emit('trch',{'message': str(msg.current_height)}, namespace='/test')
            socketio.emit('trp',{'message': str(msg.pending)}, namespace='/test')
            socketio.emit('trl',{'message': str(msg.loaded)}, namespace='/test')
        elif msg.get_type()=='EKF_STATUS_REPORT':
            socketio.emit('esrf',{'message': str(msg.flags)}, namespace='/test')
            socketio.emit('esrvv',{'message': str(msg.velocity_variance)}, namespace='/test')
            socketio.emit('esrphv',{'message': str(msg.pos_horiz_variance)}, namespace='/test')
            socketio.emit('esrcv',{'message': str(msg.compass_variance)}, namespace='/test')
            socketio.emit('esrpvv',{'message': str(msg.pos_vert_variance)}, namespace='/test')
            socketio.emit('esrtav',{'message': str(msg.terrain_alt_variance)}, namespace='/test')
            socketio.emit('esrav',{'message': str(msg.airspeed_variance)}, namespace='/test')
        elif msg.get_type()=='VIBRATION':
            socketio.emit('vibrtu',{'message': str(msg.time_usec)}, namespace='/test')
            socketio.emit('vibrvx',{'message': str(msg.vibration_x)}, namespace='/test')
            socketio.emit('vibrvy',{'message': str(msg.vibration_y)}, namespace='/test')
            socketio.emit('vibrvz',{'message': str(msg.vibration_z)}, namespace='/test')
            socketio.emit('vibrc0',{'message': str(msg.clipping_0)}, namespace='/test')
            socketio.emit('vibrc1',{'message': str(msg.clipping_1)}, namespace='/test')
            socketio.emit('vibrc2',{'message': str(msg.clipping_2)}, namespace='/test')
        elif msg.get_type()=='POSITION_TARGET_GLOBAL_INT':
            socketio.emit('ptgitbms',{'message': str(msg.time_boot_ms)}, namespace='/test')
            socketio.emit('ptgicf',{'message': str(msg.coordinate_frame)}, namespace='/test')
            socketio.emit('ptgitm',{'message': str(msg.type_mask)}, namespace='/test')
            socketio.emit('ptgilati',{'message': str(msg.lat_int)}, namespace='/test')
            socketio.emit('ptgiloni',{'message': str(msg.lon_int)}, namespace='/test')
            socketio.emit('ptgialt',{'message': str(msg.alt)}, namespace='/test')
            socketio.emit('ptgivx',{'message': str(msg.vx)}, namespace='/test')
            socketio.emit('ptgivy',{'message': str(msg.vy)}, namespace='/test')
            socketio.emit('ptgivz',{'message': str(msg.vz)}, namespace='/test')
            socketio.emit('ptgiafx',{'message': str(msg.afx)}, namespace='/test')
            socketio.emit('ptgiafy',{'message': str(msg.afy)}, namespace='/test')
            socketio.emit('ptgiafz',{'message': str(msg.afz)}, namespace='/test')
            socketio.emit('ptgiy',{'message': str(msg.yaw)}, namespace='/test')
            socketio.emit('ptgiyr',{'message': str(msg.yaw_rate)}, namespace='/test')
        elif msg.get_type()=='VFR_HUD':
            socketio.emit('vfrhas',{'message': str(msg.airspeed)}, namespace='/test')
            socketio.emit('vfrhgs',{'message': str(msg.groundspeed)}, namespace='/test')
            socketio.emit('vfrhh',{'message': str(msg.heading)}, namespace='/test')
            socketio.emit('vfrht',{'message': str(msg.throttle)}, namespace='/test')
            socketio.emit('vfrhalt',{'message': str(msg.alt)}, namespace='/test')
            socketio.emit('vfrhc',{'message': str(msg.climb)}, namespace='/test')
        elif msg.get_type()=='AOA_SSA':
            socketio.emit('aoastu',{'message': str(msg.time_usec)}, namespace='/test')
            socketio.emit('aoasaoa',{'message': str(msg.AOA)}, namespace='/test')
            socketio.emit('aoasssa',{'message': str(msg.SSA)}, namespace='/test')
        socketio.sleep(0)
        



@app.route('/')
def index():
    #only by sending this page first will the client be connected to the socketio instance
    return render_template('index.html')
@socketio.on('connect', namespace='/test')
def test_connect():
    # need visibility of the global thread object
    global thread1
    global thread2
    print('Client connected')

    #Start the random number generator thread only if the thread has not been started before.
    if not thread1.is_alive():
        print("Starting Thread 1")
        thread1 = socketio.start_background_task(messageReceiver)
    if not thread2.is_alive():
        print("Starting Thread 2")
        thread2 = socketio.start_background_task(sendMessage)

@socketio.on("scommand",namespace='/test')
def give_command(mode):
    if mode['data'] not in master.mode_mapping():
        print('Unknown mode : {}'.format(mode['data']))
        print('Try:', list(master.mode_mapping().keys()))
        sys.exit(1)
    print("uploading mode: ")
    print(type(mode))
    mode_id = master.mode_mapping()[mode['data']]
    master.set_mode(mode_id) 
    while True:
    # Wit for ACK command
# Wouldbe good to add mechanism to avoid endlessly blocking
# if th autopilot sends a NACK or never receives the message
        ack_msg = master.recv_match(type='COMMAND_ACK', blocking=True)
        ack_msg = ack_msg.to_dict()

 # Contnue waiting if the acknowledged command is not `set_mode`
        if ack_msg['command'] != mavutil.mavlink.MAV_CMD_DO_SET_MODE:
            continue

 # Prin the ACK result !
        print(mavutil.mavlink.enums['MAV_RESULT'][ack_msg['result']].description)
        socketio.emit('success',{'message': str(mavutil.mavlink.enums['MAV_RESULT'][ack_msg['result']].description)},namespace='/test')
        break


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')

#@socketio.on('connect', namespace='/command')
#def test_connect():
#    # need visibility of the global thread object
#    global thread
#    print('Client connected')

    #Start the random number generator thread only if the thread has not been started before.
#    if not thread.is_alive():
#        print("Starting Thread")
        


#@socketio.on('disconnect', namespace='/command')
#def test_disconnect():
 #   print('Client disconnected')

master = mavutil.mavlink_connection('COM15')
# Wait a heartbeat before sending commands
print(master.wait_heartbeat())
if __name__ == '__main__':
    socketio.run(app,host='http://localhost:3000/',port=5000)