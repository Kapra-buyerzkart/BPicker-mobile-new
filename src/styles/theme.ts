import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const SPACING = {
  xs: wp('1%'),
  sm: wp('2%'),
  md: wp('4%'),
  lg: wp('5%'),
  xl: wp('6%'),
};

export const FONT_SIZES = {
  xs: wp('2.8%'),
  sm: wp('3.2%'),
  md: wp('3.6%'),
  lg: wp('4.2%'),
  xl: wp('5%'),
  xxl: wp('6.5%'),
};

export { wp, hp };
