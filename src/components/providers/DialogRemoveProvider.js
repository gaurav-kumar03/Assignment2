import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ClearIcon from '@material-ui/icons/Clear'
import ErrorIcon from '@material-ui/icons/Error'
import DoneIcon from '@material-ui/icons/Done'
import Slide from '@material-ui/core/Slide'
import Typography from '@material-ui/core/Typography'
import axios from 'axios'

const styles = theme => ({
  errorTypography: {
    color: '#e91e63'
  },
  removedOkTypography: {
    color: 'green'
  }
})

function Transition(props) {
  return <Slide direction="left" {...props} />
}

class DialogRemoveProvider extends React.Component {
  state = {
    removedProviderStatus: {removed: false, error: false, message: ''},
    disableRemoveButton: false
  }

  showRemovedProviderStatus = () => {
    if (this.state.removedProviderStatus.removed) {
      if (this.state.removedProviderStatus.error) {
        return (
          <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
            &nbsp;<ErrorIcon />&nbsp;{this.state.removedProviderStatus.message}
          </Typography>
        )
      }
      else {
        return (
          <Typography variant="subtitle1" className={this.props.classes.removedOkTypography}>
            &nbsp;<DoneIcon />&nbsp;{this.state.removedProviderStatus.message}
          </Typography>
        )
      }
    }
  }

  handleButtonRemove = () => {

    let result = ''
    this.props.contracts.forEach(contract => {
      if (contract.provider_code === this.props.provider.code) {
        result = { error: 'Error: El proveedor no se puede eliminar porque está siendo usado en contratos.' }
      }
    })
    if (result.error) {
      this.setState({
        removedProviderStatus: {
          removed: true,
          error: true,
          message: result.error
        },
        disableRemoveButton: true
      })
      return false
    }

    axios.delete(`/providers/id/${this.props.provider._id}`)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          this.setState({
            removedProviderStatus: {
              removed: true,
              error: true,
              message: (response.data.error.constructor === String) ? response.data.error : JSON.stringify(response.data.error)
            },
            disableRemoveButton: true
          })
          this.props.onRefresh()
        }
        else {
          // OK
          this.setState({
            removedProviderStatus: {
              removed: true,
              error: false,
              message: 'El proveedor ha sido eliminado.'
            },
            disableRemoveButton: true
          })
          this.props.onRefresh()
          setTimeout(this.handleCloseDialog, 1500)
        }
      })
      .catch((error) => {
        this.setState({
          removedProviderStatus: {
            removed: true,
            error: true,
            message: JSON.stringify(error)
          }
        })
      })

  }

  handleCloseDialog = () => {
    this.setState({
      removedProviderStatus: {
        removed: false,
        error: false,
        message: ''
      },
      disableRemoveButton: false
    })
    this.props.onClose()
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.props.isOpen}
          onClose={this.handleCloseDialog}
          TransitionComponent={Transition}
        >
          <DialogTitle>{"¿Está seguro que desea eleminar el proveedor?"}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1">
              {`${this.props.provider.name} [${this.props.provider.code}]`}
            </Typography>
            <br />
            {this.showRemovedProviderStatus()}
            <br />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog} color="primary">
              Cerrar
            </Button>
            <Button onClick={this.handleButtonRemove} disabled={this.state.disableRemoveButton} color="secondary">
              Eliminar&nbsp;&nbsp;
              <ClearIcon />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

DialogRemoveProvider.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  provider: PropTypes.object.isRequired,
  contracts: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogRemoveProvider)
