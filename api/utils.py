
import datetime

def date_transform(obj):
    type_obj = type(obj)

    if type_obj is str:
        date_, time_ = obj.split('T')
        time_ = time_.split('.')[0]
        date = ' '.join([date_, time_])
        date_obj = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
        return date_obj
    
    return obj.strftime("%Y-%m-%dT%H:%M:%S.000")
    